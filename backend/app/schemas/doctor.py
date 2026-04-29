from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.specialty import SpecialtyRead


class DoctorCreate(BaseModel):
    full_name: str
    specialty_id: int | None = None
    bio: str | None = None
    phone: str | None = None
    email: EmailStr | None = None


class DoctorUpdate(BaseModel):
    full_name: str | None = None
    specialty_id: int | None = None
    bio: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    is_active: bool | None = None


class DoctorRead(BaseModel):
    id: int
    full_name: str
    specialty: SpecialtyRead | None
    bio: str | None
    phone: str | None
    email: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
