from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def check_auth_status():
    return {"authenticated": False, "message": "No auth configured yet."}
