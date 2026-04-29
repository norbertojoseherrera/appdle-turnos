from datetime import date, datetime, time, timedelta

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.schedule import Schedule
from app.models.specialty import Specialty
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentReadWithDetails
from app.schemas.schedule import TimeSlot


def _add_minutes(t: time, minutes: int) -> time:
    dt = datetime.combine(date.today(), t) + timedelta(minutes=minutes)
    return dt.time()


def get_available_slots(doctor_id: int, target_date: date, db: Session) -> list[TimeSlot]:
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    day_of_week = target_date.weekday()  # 0=Lunes
    schedules = (
        db.query(Schedule)
        .filter(Schedule.doctor_id == doctor_id, Schedule.day_of_week == day_of_week, Schedule.is_active == True)
        .all()
    )

    all_slots: list[tuple[time, time]] = []
    for sched in schedules:
        current = sched.start_time
        while current < sched.end_time:
            slot_end = _add_minutes(current, sched.slot_duration_minutes)
            if slot_end <= sched.end_time:
                all_slots.append((current, slot_end))
            current = slot_end

    booked = (
        db.query(Appointment.start_time)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.status != "cancelled",
        )
        .all()
    )
    booked_times = {row.start_time for row in booked}

    return [
        TimeSlot(start_time=s.strftime("%H:%M"), end_time=e.strftime("%H:%M"))
        for s, e in all_slots
        if s not in booked_times
    ]


def book_appointment(req: AppointmentCreate, patient: User, db: Session) -> Appointment:
    doctor = db.query(Doctor).filter(Doctor.id == req.doctor_id, Doctor.is_active == True).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    # Verificar que el slot esté disponible
    available = get_available_slots(req.doctor_id, req.appointment_date, db)
    requested = req.start_time.strftime("%H:%M")
    slot = next((s for s in available if s.start_time == requested), None)
    if not slot:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El horario no está disponible")

    end_time = datetime.strptime(slot.end_time, "%H:%M").time()
    appt = Appointment(
        patient_id=patient.id,
        doctor_id=req.doctor_id,
        appointment_date=req.appointment_date,
        start_time=req.start_time,
        end_time=end_time,
        reason=req.reason,
        status="pending",
    )
    db.add(appt)
    try:
        db.commit()
        db.refresh(appt)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El horario ya fue reservado")
    return appt


def _enrich(appt: Appointment) -> AppointmentReadWithDetails:
    data = AppointmentReadWithDetails.model_validate(appt)
    data.doctor_full_name = appt.doctor.full_name if appt.doctor else None
    data.doctor_specialty = appt.doctor.specialty.name if appt.doctor and appt.doctor.specialty else None
    data.patient_full_name = appt.patient.full_name if appt.patient else None
    data.patient_email = appt.patient.email if appt.patient else None
    return data
