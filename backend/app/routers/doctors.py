from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_admin
from app.models.doctor import Doctor
from app.models.schedule import Schedule
from app.schemas.doctor import DoctorCreate, DoctorRead, DoctorUpdate
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate, TimeSlot
from app.services.appointment_service import get_available_slots

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=list[DoctorRead])
def list_doctors(specialty_id: int | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(Doctor).filter(Doctor.is_active == True)
    if specialty_id:
        q = q.filter(Doctor.specialty_id == specialty_id)
    return q.all()


@router.get("/{doctor_id}", response_model=DoctorRead)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    return doc


@router.post("", response_model=DoctorRead, status_code=201, dependencies=[Depends(require_admin)])
def create_doctor(body: DoctorCreate, db: Session = Depends(get_db)):
    doc = Doctor(**body.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.put("/{doctor_id}", response_model=DoctorRead, dependencies=[Depends(require_admin)])
def update_doctor(doctor_id: int, body: DoctorUpdate, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doctor_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    doc.is_active = False
    db.commit()


# --- Schedules ---

@router.get("/{doctor_id}/schedules", response_model=list[ScheduleRead])
def get_schedules(doctor_id: int, db: Session = Depends(get_db)):
    return db.query(Schedule).filter(Schedule.doctor_id == doctor_id).all()


@router.post("/{doctor_id}/schedules", response_model=ScheduleRead, status_code=201, dependencies=[Depends(require_admin)])
def add_schedule(doctor_id: int, body: ScheduleCreate, db: Session = Depends(get_db)):
    sched = Schedule(doctor_id=doctor_id, **body.model_dump())
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched


@router.put("/{doctor_id}/schedules/{schedule_id}", response_model=ScheduleRead, dependencies=[Depends(require_admin)])
def update_schedule(doctor_id: int, schedule_id: int, body: ScheduleUpdate, db: Session = Depends(get_db)):
    sched = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.doctor_id == doctor_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(sched, field, value)
    db.commit()
    db.refresh(sched)
    return sched


@router.delete("/{doctor_id}/schedules/{schedule_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_schedule(doctor_id: int, schedule_id: int, db: Session = Depends(get_db)):
    sched = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.doctor_id == doctor_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    db.delete(sched)
    db.commit()


@router.get("/{doctor_id}/available-slots", response_model=list[TimeSlot])
def available_slots(
    doctor_id: int,
    date: date = Query(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return get_available_slots(doctor_id, date, db)
