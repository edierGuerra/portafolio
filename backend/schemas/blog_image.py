from pydantic import BaseModel, ConfigDict


class BlogImageRead(BaseModel):
    id: int
    image_url: str
    position: int

    model_config = ConfigDict(from_attributes=True)
