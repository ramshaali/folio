from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.adk.runners import Runner
from google.genai import types
from core.session_manager import session_service, create_session
from my_agent.agent import root_agent
import uuid
import asyncio

APP_NAME = "content_creator_root_agent"
router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str
    session_id: str | None = None
    user_id: str | None = None

@router.post("/")
async def generate_article(req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    # 1️⃣ Use provided user_id or generate
    user_id = req.user_id or f"user_{uuid.uuid4().hex[:8]}"

    # 2️⃣ Create session if not provided
    if req.session_id:
        session_id = req.session_id
    else:
        session = await create_session(user_id)
        session_id = session.id

    # 3️⃣ Initialize Runner
    runner = Runner(
        app_name=APP_NAME,
        agent=root_agent,
        session_service=session_service
    )

    # 4️⃣ Prepare content
    content = types.Content(parts=[types.Part(text=req.prompt)])

    # 5️⃣ Run the agent
    final_event = None
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=content
    ):
        # Check if event has actual text
        if event.content.parts and any(p.text for p in event.content.parts):
            final_event = event  # Keep updating until the last one

    if not final_event:
        raise HTTPException(status_code=500, detail="No response from agent")

    # Concatenate all text parts from the final event
    output_text = " ".join([p.text for p in final_event.content.parts if p.text])

    return {
        "session_id": session_id,
        "user_id": user_id,
        "output": output_text
    }