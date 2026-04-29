import uuid
from datetime import date, datetime, time

from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    start_time: time
    reason: str | None = None


class AppointmentRead(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    reason: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AppointmentReadWithDetails(AppointmentRead):
    doctor_full_name: str | None = None
    doctor_specialty: str | None = None
    patient_full_name: str | None = None
    patient_email: str | None = None


class StatusUpdate(BaseModel):
    status: str


class NotesUpdate(BaseModel):
    notes: str
