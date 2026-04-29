from sqlalchemy import Boolean, Column, ForeignKey, Integer, SmallInteger, Time, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Schedule(Base):
    __tablename__ = "schedules"
    __table_args__ = (UniqueConstraint("doctor_id", "day_of_week", "start_time", name="uq_schedule_slot"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(SmallInteger, nullable=False)  # 0=Lunes ... 6=Domingo
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_duration_minutes = Column(SmallInteger, default=30)
    is_active = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="schedules")
