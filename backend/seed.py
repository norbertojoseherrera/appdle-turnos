"""Script para poblar la base de datos con el admin inicial y datos de ejemplo."""
import sys
import os
from datetime import time

sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.specialty import Specialty
from app.models.doctor import Doctor
from app.models.schedule import Schedule


def seed():
    db = SessionLocal()
    try:
        # Admin
        if not db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first():
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                full_name="Administrador",
                role="admin",
            )
            db.add(admin)
            db.commit()
            print(f"Admin creado: {settings.FIRST_ADMIN_EMAIL}")
        else:
            print("Admin ya existe, omitiendo.")

        # Especialidades
        specialties_data = [
            ("Medicina General", "Consultas generales y preventivas"),
            ("Pediatría", "Atención médica para niños y adolescentes"),
            ("Cardiología", "Diagnóstico y tratamiento de enfermedades del corazón"),
        ]
        specialty_objects = []
        for name, desc in specialties_data:
            sp = db.query(Specialty).filter(Specialty.name == name).first()
            if not sp:
                sp = Specialty(name=name, description=desc)
                db.add(sp)
                db.commit()
                db.refresh(sp)
                print(f"Especialidad creada: {name}")
            specialty_objects.append(sp)

        # Médicos
        doctors_data = [
            ("Dra. Ana García", specialty_objects[0], "Médica generalista con 10 años de experiencia."),
            ("Dr. Carlos López", specialty_objects[1], "Pediatra especializado en neonatología."),
        ]
        for full_name, specialty, bio in doctors_data:
            if not db.query(Doctor).filter(Doctor.full_name == full_name).first():
                doc = Doctor(full_name=full_name, specialty=specialty, bio=bio)
                db.add(doc)
                db.commit()
                db.refresh(doc)
                # Horarios Lun-Vie 09:00-17:00 slots de 30 min
                for day in range(5):
                    sched = Schedule(
                        doctor_id=doc.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(17, 0),
                        slot_duration_minutes=30,
                    )
                    db.add(sched)
                db.commit()
                print(f"Médico creado: {full_name}")

        print("\nSeed completado exitosamente.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
