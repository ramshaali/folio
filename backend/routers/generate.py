from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.adk.runners import Runner
from google.genai import types
from core.session_manager import session_service, create_session
from my_agent.agent import root_agent
from fastapi.responses import StreamingResponse
import uuid
import asyncio
import json

APP_NAME = "content_creator_root_agent"
router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str
    session_id: str | None = None
    user_id: str | None = None
    

@router.post("/stream")
async def generate_article_stream(req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    user_id = req.user_id or f"user_{uuid.uuid4().hex[:8]}"

    if req.session_id:
        session_id = req.session_id
    else:
        session = await create_session(user_id)
        session_id = session.id


    runner = Runner(
        app_name=APP_NAME,
        agent=root_agent,
        session_service=session_service
    )

    content = types.Content(parts=[types.Part(text=req.prompt)])

    async def event_generator():
        
        yield json.dumps({
            "status": "init",
            "session_id": session_id,
            "user_id": user_id
        }) + "\n"
        
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content
        ):
            if event.content and event.content.parts and any(p.text for p in event.content.parts):
                text_output = " ".join([p.text for p in event.content.parts if p.text])
                chunk = {
                    "agent_name": event.author,
                    "text": text_output
                }
                yield json.dumps(chunk) + "\n"  # newline-separated JSON chunks

        # send a final signal that streaming is done
        yield json.dumps({"status": "done"}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/json")

