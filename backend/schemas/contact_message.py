from datetime import datetime as DateTimeType

from pydantic import BaseModel, ConfigDict, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=120)
    company: str = Field(default="", max_length=120)
    budget: str = Field(default="", max_length=80)
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=10, max_length=4000)


class ContactMessageRead(BaseModel):
    id: int
    name: str
    email: str
    company: str
    budget: str
    subject: str
    message: str
    created_at: DateTimeType

    model_config = ConfigDict(from_attributes=True)
