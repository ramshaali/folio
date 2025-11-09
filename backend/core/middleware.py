from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
load_dotenv()



API_KEY = os.environ.get("APP_API_KEY")

async def api_key_validator(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)


    # Check the API key header
    client_key = request.headers.get("x-api-key")

    if client_key != API_KEY:
        return JSONResponse(
            status_code=401,
            content={"error": "Invalid or missing APP API key"}
        )

    return await call_next(request)
