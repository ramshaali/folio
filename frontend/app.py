import streamlit as st
import requests
import json
import base64
from PIL import Image
import io
import httpx
from utils.api_client import BACKEND_URL

st.set_page_config(page_title="🧠 Multi-Agent Content Creator", page_icon="🧠")
st.title("🧠 AI Multi-Agent Content Creator")

if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None

user_input = st.text_area("✍️ Enter a topic, link, or idea for your article:", height=120)

def generate_article(prompt):
    payload = {
        "prompt": prompt,
        "session_id": st.session_state.session_id,
        "user_id": st.session_state.user_id,
    }
    response = requests.post(f"{BACKEND_URL}/api/generate", json=payload)
    return response

def start_new_session():
    res = requests.post(f"{BACKEND_URL}/api/session/new")
    return res



def stream_agent_outputs(prompt):
    payload = {
        "prompt": prompt,
        "session_id": st.session_state.session_id,
        "user_id": st.session_state.user_id,
    }
    with httpx.stream("POST", f"{BACKEND_URL}/api/generate/stream", json=payload, timeout=None) as response:
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                if data.get("status") == "done":
                    break
                yield data.get("agent_name", "Unknown"), data.get("text", "")

if st.button("Generate Content"):
    if not user_input.strip():
        st.warning("Please enter a topic first.")
    else:
        placeholder = st.empty()
        for agent_name, text in stream_agent_outputs(user_input):
            placeholder.markdown(f"**{agent_name}**:\n{text}\n---")


if st.button("Start New Session"):
    res = start_new_session()
    if res.status_code == 200:
        data = res.json()
        st.session_state.session_id = data["session_id"]
        st.session_state.user_id = data["user_id"]
        st.success("✅ New session started!")
    else:
        st.error("Failed to start new session.")
