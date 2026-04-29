from datetime import time

from pydantic import BaseModel


class ScheduleCreate(BaseModel):
    day_of_week: int  # 0=Lunes ... 6=Domingo
    start_time: time
    end_time: time
    slot_duration_minutes: int = 30


class ScheduleRead(BaseModel):
    id: int
    doctor_id: int
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration_minutes: int
    is_active: bool

    model_config = {"from_attributes": True}


class ScheduleUpdate(BaseModel):
    start_time: time | None = None
    end_time: time | None = None
    slot_duration_minutes: int | None = None
    is_active: bool | None = None


class TimeSlot(BaseModel):
    start_time: str
    end_time: str
