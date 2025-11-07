import streamlit as st
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from my_agent.agent import root_agent
import uuid
from dotenv import load_dotenv

load_dotenv()

APP_NAME = "content_creator_root_agent"

st.set_page_config(page_title="Multi-Agent AI Writer", page_icon="🧠")
st.title("🧠 AI Multi-Agent Content Creator")

# Initialize session service once globally
if "session_service" not in st.session_state:
    st.session_state.session_service = InMemorySessionService()

# Async helper to create session
async def create_session_async(session_service, user_id):
    return await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        state={}
    )

# Initialize or restore session on load
if "adk_session" not in st.session_state:
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    st.session_state.user_id = user_id
    st.session_state.adk_session = asyncio.run(create_session_async(st.session_state.session_service, user_id))

user_input = st.text_area("✍️ Enter a topic, link, or idea for your article:", height=120)

async def run_agent(runner, user_id, session_id, content):
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            return event
    return None

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
                    session_id=st.session_state.adk_session.id,  # use `.id` here
                    content=content
                )
            )

        if response:
            st.subheader("📝 Generated Article")
            st.write(response.content.parts[0].text)
        else:
            st.warning("No response from agent.")

if st.button("Start New Session"):
    new_user_id = f"user_{uuid.uuid4().hex[:8]}"
    st.session_state.user_id = new_user_id
    # Await the async session creation here!
    st.session_state.adk_session = asyncio.run(create_session_async(st.session_state.session_service, new_user_id))
    st.success("✅ New session started! You can now enter a fresh topic.")
