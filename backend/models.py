from pydantic import BaseModel
from typing import Optional

class TodoCreate(BaseModel):
    title: str
    user_id: str

class TodoUpdate(BaseModel):
    is_complete: Optional[bool] = None
    title: Optional[str] = None

class AIRequest(BaseModel):
    user_id: str
    current_todos: list[str]