from fastapi import FastAPI
from routers import generate, session

def register_routers(app: FastAPI):
    app.include_router(session.router, prefix="/api/session", tags=["Session"])
    app.include_router(generate.router, prefix="/api/generate", tags=["Generation"])
