from google.adk.sessions import InMemorySessionService
from google.cloud import firestore
import asyncio

# Initialize Firestore client and in-memory service
db = firestore.AsyncClient()
session_service = InMemorySessionService()

async def create_or_update_session(browser_id: str, user_id: str):
    """
    Creates or updates a session linked to a specific x-browser-id.
    - If an entry for browser_id exists in Firestore, reuse/overwrite it.
    - If new, create and store it in Firestore.
    """
    sessions_ref = db.collection("sessions")
    doc_ref = sessions_ref.document(browser_id)
    existing = await doc_ref.get()

    # Always create a new session in memory
    session = await session_service.create_session(
        app_name="content_creator_root_agent",
        user_id=user_id,
        state={}
    )

    if existing.exists:
        old_session_id = existing.get("session_id")
        if old_session_id != session.id:
            try:
                await session_service.delete_session(old_session_id)
                print(f"Deleted old in-memory session for {browser_id}")

            except Exception as e:
                print(f"Could not delete old session {old_session_id}: {e}")      
    
    # Store/overwrite session record in Firestore
    await doc_ref.set({
        "browser_id": browser_id,
        "user_id": user_id,
        "session_id": session.id,
    })

    return session
