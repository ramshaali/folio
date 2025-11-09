import uvicorn
from core.router_register import register_routers
from fastapi import FastAPI
from core.middleware import api_key_validator
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

app.add_middleware(BaseHTTPMiddleware, dispatch=api_key_validator)

register_routers(app)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "AI Multi-Agent Backend"}



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

