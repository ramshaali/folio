# routers/session.py
from fastapi import APIRouter, Request, HTTPException
import uuid
from core.session_manager import create_or_update_session

router = APIRouter()

@router.post("/new")
async def new_session(request: Request):
    # Extract browser ID from header
    browser_id = request.headers.get("x-browser-id")
    if not browser_id:
        raise HTTPException(status_code=400, detail="Missing x-browser-id header")

    user_id = f"user_{uuid.uuid4().hex[:8]}"
    session = await create_or_update_session(browser_id, user_id)

    return {
        "session_id": session.id,
        "user_id": user_id,
        "browser_id": browser_id
    }
