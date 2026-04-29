from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyRead, SpecialtyUpdate

router = APIRouter(prefix="/specialties", tags=["specialties"])


@router.get("", response_model=list[SpecialtyRead])
def list_specialties(db: Session = Depends(get_db)):
    return db.query(Specialty).all()


@router.post("", response_model=SpecialtyRead, status_code=201, dependencies=[Depends(require_admin)])
def create_specialty(body: SpecialtyCreate, db: Session = Depends(get_db)):
    sp = Specialty(**body.model_dump())
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return sp


@router.put("/{sp_id}", response_model=SpecialtyRead, dependencies=[Depends(require_admin)])
def update_specialty(sp_id: int, body: SpecialtyUpdate, db: Session = Depends(get_db)):
    sp = db.query(Specialty).filter(Specialty.id == sp_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(sp, field, value)
    db.commit()
    db.refresh(sp)
    return sp


@router.delete("/{sp_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_specialty(sp_id: int, db: Session = Depends(get_db)):
    sp = db.query(Specialty).filter(Specialty.id == sp_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    db.delete(sp)
    db.commit()
