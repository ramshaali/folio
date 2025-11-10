from google.cloud import firestore
import time

class FirestoreSessionService:
    def __init__(self):
        # Use AsyncClient for FastAPI
        self.db = firestore.AsyncClient()
        self.collection = self.db.collection("sessions")

    async def create_session(self, user_id: str, app_name: str):
        session_id = f"{user_id}-{int(time.time())}"
        await self.collection.document(session_id).set({
            "user_id": user_id,
            "app_name": app_name,
            "state": {},
            "created_at": firestore.SERVER_TIMESTAMP,
        })
        # Return a minimal object to match InMemorySessionService
        return type("Session", (), {"id": session_id})

    async def get_session(self, session_id: str):
        doc = await self.collection.document(session_id).get()
        return doc.to_dict() if doc.exists else None

    async def update_session(self, session_id: str, state: dict):
        await self.collection.document(session_id).update({"state": state})

    async def delete_session(self, session_id: str):
        await self.collection.document(session_id).delete()
