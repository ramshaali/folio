from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
load_dotenv()



API_KEY = os.environ.get("API_KEY")

async def api_key_validator(request: Request, call_next):
    # Allow specific routes without API key
    if request.url.path.startswith("/api/auth/status"):
        return await call_next(request)

    # Check the API key header
    client_key = request.headers.get("x-api-key")

    if client_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

    return await call_next(request)
