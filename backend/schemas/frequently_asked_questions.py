from typing import Optional

from pydantic import BaseModel, ConfigDict


class FrequentlyAskedQuestionBase(BaseModel):
    question: str
    question_en: Optional[str] = None
    answer: str
    answer_en: Optional[str] = None


class FrequentlyAskedQuestionCreate(FrequentlyAskedQuestionBase):
    pass


class FrequentlyAskedQuestionUpdate(BaseModel):
    question: Optional[str] = None
    question_en: Optional[str] = None
    answer: Optional[str] = None
    answer_en: Optional[str] = None


class FrequentlyAskedQuestionRead(FrequentlyAskedQuestionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
