from typing import Optional

from pydantic import BaseModel, ConfigDict


class FrequentlyAskedQuestionBase(BaseModel):
    question: str
    answer: str


class FrequentlyAskedQuestionCreate(FrequentlyAskedQuestionBase):
    pass


class FrequentlyAskedQuestionUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None


class FrequentlyAskedQuestionRead(FrequentlyAskedQuestionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
