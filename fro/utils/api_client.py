import os, requests

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

class APIClient:
    def __init__(self, base_url=None): self.base = base_url or BACKEND_URL.rstrip('/')
    def new_session(self): return requests.post(f"{self.base}/api/session/new")
    def generate(self, prompt): return requests.post(f"{self.base}/api/generate", json={"prompt": prompt})
    def publish(self, title, content): return requests.post(f"{self.base}/api/publish", json={"title": title, "content": content})
