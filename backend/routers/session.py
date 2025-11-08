from fastapi import APIRouter
import uuid
from core.session_manager import create_session

router = APIRouter()

@router.post("/new")
async def new_session():
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    session = await create_session(user_id)
    return {"session_id": session.id, "user_id": user_id}
