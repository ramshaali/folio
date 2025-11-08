import uvicorn
from core.router_register import register_routers
from fastapi import FastAPI

app = FastAPI()

register_routers(app)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "AI Multi-Agent Backend"}



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

