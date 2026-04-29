from pydantic import BaseModel


class SpecialtyCreate(BaseModel):
    name: str
    description: str | None = None


class SpecialtyRead(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class SpecialtyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
