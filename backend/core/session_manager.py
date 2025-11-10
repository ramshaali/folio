from core.firestore_session_service import FirestoreSessionService

session_service: FirestoreSessionService | None = None

async def get_session_service():
    global session_service
    if session_service is None:
        session_service = FirestoreSessionService()
    return session_service

async def create_session(user_id: str):
    service = await get_session_service()
    return await service.create_session(
        app_name="content_creator_root_agent",
        user_id=user_id,
    )
