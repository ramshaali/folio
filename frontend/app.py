import streamlit as st
import requests
import json
import base64
from PIL import Image
import io
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

if st.button("Generate Content"):
    if not user_input.strip():
        st.warning("Please enter a topic first.")
    else:
        st.info("🤖 Agents are working together...")
        response = generate_article(user_input)

        if response.status_code == 200:
            data = response.json()
            st.session_state.session_id = data["session_id"]
            st.session_state.user_id = data["user_id"]

            text_output = data["output"]
            try:
                parsed = json.loads(text_output)
                if "image_base64" in parsed:
                    st.subheader("📝 Generated Article")
                    st.write(parsed.get("article_text", "No article text provided."))
                    st.write(f"**Image Prompt:** {parsed['image_prompt']}")
                    img_data = base64.b64decode(parsed["image_base64"])
                    image = Image.open(io.BytesIO(img_data))
                    st.image(image, caption="Generated Image")
                else:
                    st.subheader("📝 Article")
                    st.write(text_output)
            except json.JSONDecodeError:
                st.subheader("📝 Article")
                st.write(text_output)
        else:
            st.error(f"Backend error: {response.text}")

if st.button("Start New Session"):
    res = start_new_session()
    if res.status_code == 200:
        data = res.json()
        st.session_state.session_id = data["session_id"]
        st.session_state.user_id = data["user_id"]
        st.success("✅ New session started!")
    else:
        st.error("Failed to start new session.")
