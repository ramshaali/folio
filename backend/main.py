import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.router_register import register_routers
from core.middleware import api_key_validator
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# -----------------------
# CORS CONFIGURATION
# -----------------------
origins = [
    "https://folio-178508032061.us-central1.run.app/",  
    "http://localhost:5173", 
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# API KEY VALIDATION
# -----------------------
app.add_middleware(BaseHTTPMiddleware, dispatch=api_key_validator)

# -----------------------
# ROUTERS
# -----------------------
register_routers(app)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Folio AI Multi-Agent Backend"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
