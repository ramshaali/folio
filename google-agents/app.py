import streamlit as st
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.events import Event, EventActions  # you may need to adjust imports
from my_agent.agent import root_agent
import uuid

st.set_page_config(page_title="Multi-Agent AI Writer", page_icon="🧠")
st.title("🧠 AI Multi-Agent Content Creator")

# Init session service once globally
if "session_service" not in st.session_state:
    st.session_state.session_service = InMemorySessionService()

# Init or restore session per user
if "adk_session" not in st.session_state:
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    st.session_state.user_id = user_id
    st.session_state.adk_session = st.session_state.session_service.create_session(
        app_name="content_creator_root_agent",
        user_id=user_id,
        state={}
    )

user_input = st.text_area("✍️ Enter a topic, link, or idea for your article:", height=120)

async def run_agent(runner):
    response = None
    async for event in runner.run_async():
        if event.is_final_response():
            response = event
            break
    return response

if st.button("Generate Content"):
    if not user_input.strip():
        st.warning("Please enter a topic first.")
    else:
        runner = Runner(
            app_name="content_creator_root_agent",
            agent=root_agent,
            session_service=st.session_state.session_service
        )
        
        # Add the user's input as an event to the session
        user_event = Event(
            author=EventAuthor.USER,
            content=user_input
        )
        st.session_state.session_service.append_event(
            st.session_state.adk_session,
            user_event
        )
        
        with st.spinner("🤖 Agents are working together..."):
            # Run async event loop without arguments
            response = asyncio.run(run_agent(runner))

        if response:
            st.subheader("📝 Generated Article")
            st.write(response.content.parts[0].text)
        else:
            st.warning("No response from agent.")

if st.button("Start New Session"):
    st.session_state.adk_session = st.session_state.session_service.create_session(
        app_name="content_creator_root_agent",
        user_id=f"user_{uuid.uuid4().hex[:8]}",
        state={}
    )
    st.success("✅ New session started! You can now enter a fresh topic.")
