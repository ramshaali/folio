from fastapi import FastAPI
from routers import generate, session, auth

def register_routers(app: FastAPI):
    app.include_router(session.router, prefix="/api/session", tags=["Session"])
    app.include_router(generate.router, prefix="/api/generate", tags=["Generation"])
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
