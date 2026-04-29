from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db, require_admin
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.specialty import Specialty
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentReadWithDetails,
    NotesUpdate,
    StatusUpdate,
)
from app.services.appointment_service import _enrich, book_appointment

router = APIRouter(prefix="/appointments", tags=["appointments"])

VALID_STATUSES = {"pending", "confirmed", "cancelled", "completed"}


def _load(appt_id: str, db: Session) -> Appointment:
    appt = (
        db.query(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.specialty), joinedload(Appointment.patient))
        .filter(Appointment.id == appt_id)
        .first()
    )
    if not appt:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return appt


@router.post("", response_model=AppointmentRead, status_code=201)
def create_appointment(
    body: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Solo los pacientes pueden reservar turnos")
    return book_appointment(body, current_user, db)


@router.get("/mine", response_model=list[AppointmentReadWithDetails])
def my_appointments(
    upcoming: bool | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.specialty), joinedload(Appointment.patient))
        .filter(Appointment.patient_id == current_user.id)
    )
    if upcoming is True:
        q = q.filter(Appointment.appointment_date >= date.today())
    elif upcoming is False:
        q = q.filter(Appointment.appointment_date < date.today())
    appts = q.order_by(Appointment.appointment_date, Appointment.start_time).all()
    return [_enrich(a) for a in appts]


@router.get("", response_model=list[AppointmentReadWithDetails], dependencies=[Depends(require_admin)])
def all_appointments(
    appt_date: date | None = Query(None),
    doctor_id: int | None = Query(None),
    appt_status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Appointment).options(
        joinedload(Appointment.doctor).joinedload(Doctor.specialty), joinedload(Appointment.patient)
    )
    if appt_date:
        q = q.filter(Appointment.appointment_date == appt_date)
    if doctor_id:
        q = q.filter(Appointment.doctor_id == doctor_id)
    if appt_status:
        q = q.filter(Appointment.status == appt_status)
    appts = q.order_by(Appointment.appointment_date, Appointment.start_time).all()
    return [_enrich(a) for a in appts]


@router.get("/{appt_id}", response_model=AppointmentReadWithDetails)
def get_appointment(
    appt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = _load(appt_id, db)
    if current_user.role != "admin" and appt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    return _enrich(appt)


@router.put("/{appt_id}/cancel", response_model=AppointmentRead)
def cancel_appointment(
    appt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = _load(appt_id, db)
    if current_user.role != "admin" and appt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    if appt.status in ("cancelled", "completed"):
        raise HTTPException(status_code=400, detail=f"No se puede cancelar un turno con estado '{appt.status}'")
    appt.status = "cancelled"
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appt_id}/status", response_model=AppointmentRead, dependencies=[Depends(require_admin)])
def update_status(appt_id: str, body: StatusUpdate, db: Session = Depends(get_db)):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Valores posibles: {VALID_STATUSES}")
    appt = _load(appt_id, db)
    appt.status = body.status
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appt_id}/notes", response_model=AppointmentRead, dependencies=[Depends(require_admin)])
def update_notes(appt_id: str, body: NotesUpdate, db: Session = Depends(get_db)):
    appt = _load(appt_id, db)
    appt.notes = body.notes
    db.commit()
    db.refresh(appt)
    return appt
