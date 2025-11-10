from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from google.adk.runners import Runner
from google.genai import types
from core.session_manager import create_or_update_session, session_service
from my_agent.agent import root_agent
from my_agent.utils import analyze_output_with_gemini
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
async def generate_article_stream(request: Request, req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    browser_id = request.headers.get("x-browser-id")  # <-- Extract browser ID if available
    if not browser_id:
        raise HTTPException(status_code=400, detail="Missing x-browser-id header")

    user_id = req.user_id or f"user_{uuid.uuid4().hex[:8]}"

    if req.session_id:
        session_id = req.session_id
    else:
        session = await create_or_update_session(browser_id, user_id)

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
                agent_name = getattr(event, "author", None) or "writer_agent"
                # Map root agent to writer agent for consistency

                
                if agent_name in {"writer_agent", "refine_agent", "content_creator_root_agent"}:
                    structured_chunk = await analyze_output_with_gemini(agent_name, text_output)
                else:
                    structured_chunk = {
                        "agent_name": agent_name,
                        "text": text_output
                    }

                print("structured chunk: ", structured_chunk)
                yield json.dumps(structured_chunk) + "\n"
               

        # send a final signal that streaming is done
        yield json.dumps({"status": "done"}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/json")

