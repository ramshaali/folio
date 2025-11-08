import streamlit as st
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from my_agent.agent import root_agent
import uuid
from dotenv import load_dotenv
import json
import base64
from PIL import Image
import io

load_dotenv()

APP_NAME = "content_creator_root_agent"

st.set_page_config(page_title="🧠 AI Multi-Agent Content Creator", page_icon="🧠")
st.title("🧠 AI Multi-Agent Content Creator")

if "session_service" not in st.session_state:
    st.session_state.session_service = InMemorySessionService()

async def create_session_async(session_service, user_id):
    return await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        state={}
    )

if "adk_session" not in st.session_state:
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    st.session_state.user_id = user_id
    st.session_state.adk_session = asyncio.run(create_session_async(st.session_state.session_service, user_id))

user_input = st.text_area("✍️ Enter a topic, link, or idea for your article:", height=120)

async def run_agent(runner, user_id, session_id, content):
    final_event = None
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            final_event = event
    return final_event

if st.button("Generate Content"):
    if not user_input.strip():
        st.warning("Please enter a topic first.")
    else:
        runner = Runner(
            app_name=APP_NAME,
            agent=root_agent,
            session_service=st.session_state.session_service
        )

        content = types.Content(parts=[types.Part(text=user_input)])

        with st.spinner("🤖 Agents are working together..."):
            response = asyncio.run(
                run_agent(
                    runner,
                    user_id=st.session_state.user_id,
                    session_id=st.session_state.adk_session.id,
                    content=content
                )
            )

        if response:
            text_output = response.content.parts[0].text

            # Try to parse as JSON to check if this is article+image response (new article)
            try:
                parsed = json.loads(text_output)
                if "image_base64" in parsed and "image_prompt" in parsed:
                    st.subheader("📝 Generated Article")
                    # Display the article text separately, which should be passed along in the chain,
                    # but if not, you may want to modify the agent to include article text in this JSON
                    # For now, just display prompt and image

                    st.write(f"**Image Prompt:** {parsed['image_prompt']}")

                    img_data = base64.b64decode(parsed["image_base64"])
                    image = Image.open(io.BytesIO(img_data))
                    st.image(image, caption="Generated Image")

                    # Optionally also show the original article text if you modify the image generation to include it
                    # If not included, you can just say:
                    st.info("Article text is not included in image generation output. You may want to update the pipeline to include article text here.")
                else:
                    # This is likely refined article text (string)
                    st.subheader("📝 Refined Article")
                    st.write(text_output)

            except json.JSONDecodeError:
                # Not JSON, so treat as simple text (refined or direct article)
                st.subheader("📝 Article")
                st.write(text_output)
        else:
            st.warning("No response from agent.")

if st.button("Start New Session"):
    new_user_id = f"user_{uuid.uuid4().hex[:8]}"
    st.session_state.user_id = new_user_id
    st.session_state.adk_session = asyncio.run(create_session_async(st.session_state.session_service, new_user_id))
    st.success("✅ New session started! You can now enter a fresh topic.")
