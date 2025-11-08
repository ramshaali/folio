from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()

async def create_session(user_id: str):
    return await session_service.create_session(
        app_name="content_creator_root_agent",
        user_id=user_id,
        state={}
    )
