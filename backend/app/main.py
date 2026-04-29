from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin, appointments, auth, doctors, specialties

app = FastAPI(title="Appdle - Turnos Médicos", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(specialties.router, prefix="/api/v1")
app.include_router(doctors.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Appdle API - Turnos Médicos", "docs": "/docs"}
