import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

print(f"Using BACKEND_URL: {BACKEND_URL}")
