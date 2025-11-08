import streamlit as st
import requests
import json
import base64
from PIL import Image
import io
from utils.api_client import BACKEND_URL
from datetime import datetime

# ====================
# PROPER TWO-COLUMN LAYOUT WITH GOLD BUTTONS
# ====================

def inject_proper_layout_css():
    st.markdown(f"""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
    
    /* Global Styles */
    .main .block-container {{
        padding-top: 0rem;
        max-width: 100%;
        padding-left: 1rem;
        padding-right: 1rem;
    }}
    
    .stApp {{
        background-color: #FEFCF8;
    }}
    
    /* Header Bar */
    .header-container {{
        background: #FFFFFF;
        padding: 1rem 0;
        margin-bottom: 1rem;
        border-bottom: 1px solid #E8E5DE;
    }}
    
    .logo {{
        font-family: 'Playfair Display', serif;
        font-size: 2.2rem;
        font-weight: 700;
        color: #2C2C2C;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }}
    
    .logo-dot {{
        color: #B38B59;
    }}
    
    .tagline {{
        font-family: 'Lora', serif;
        font-size: 1rem;
        color: #5C5C5C;
        font-style: italic;
    }}
    
    /* Main two-column layout */
    .main-columns {{
        display: flex;
        gap: 1.5rem;
        height: calc(100vh - 140px);
    }}
    
    /* Chat Panel */
    .chat-column {{
        flex: 4;
        display: flex;
        flex-direction: column;
    }}
    
    .chat-container {{
        background: #FFFFFF;
        border-radius: 12px;
        border: 1px solid #E8E5DE;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }}
    
    .chat-header {{
        padding: 1.5rem;
        border-bottom: 1px solid #E8E5DE;
        background: #F8F5F0;
    }}
    
    .chat-messages {{
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-height: 0;
    }}
    
    .chat-input-area {{
        padding: 1.5rem;
        border-top: 1px solid #E8E5DE;
        background: #FEFCF8;
    }}
    
    /* Article Panel */
    .article-column {{
        flex: 6;
        display: flex;
        flex-direction: column;
    }}
    
    .article-container {{
        background: #FFFFFF;
        border-radius: 12px;
        border: 1px solid #E8E5DE;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }}
    
    .article-header {{
        padding: 1.5rem;
        border-bottom: 1px solid #E8E5DE;
        background: #F8F5F0;
    }}
    
    .article-content {{
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        font-family: 'Lora', serif;
        line-height: 1.7;
        color: #2C2C2C;
        min-height: 0;
    }}
    
    /* Message Bubbles */
    .message {{
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }}
    
    .message-user {{
        flex-direction: row-reverse;
    }}
    
    .message-ai {{
        flex-direction: row;
    }}
    
    .avatar {{
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        flex-shrink: 0;
    }}
    
    .avatar-user {{
        background: #B38B59;
        color: white;
    }}
    
    .avatar-ai {{
        background: #2C2C2C;
        color: white;
    }}
    
    .message-content {{
        max-width: 70%;
        padding: 1rem 1.25rem;
        border-radius: 18px;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        line-height: 1.5;
    }}
    
    .message-user .message-content {{
        background: #B38B59;
        color: white;
        border-bottom-right-radius: 4px;
    }}
    
    .message-ai .message-content {{
        background: #F8F5F0;
        color: #2C2C2C;
        border-bottom-left-radius: 4px;
        border: 1px solid #E8E5DE;
    }}
    
    .message-time {{
        font-size: 0.75rem;
        color: #8C8C8C;
        margin-top: 0.25rem;
    }}
    
    .message-user .message-time {{
        text-align: right;
    }}
    
    .message-ai .message-time {{
        text-align: left;
    }}
    
    /* GOLD BUTTONS - Fixed */
    .stButton > button:first-child {{
        background-color: #B38B59 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
        font-family: 'Inter', sans-serif !important;
        font-weight: 600 !important;
    }}
    
    .stButton > button:first-child:hover {{
        background-color: #9A7749 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(179, 139, 89, 0.3) !important;
    }}
    
    /* Secondary buttons */
    .stButton > button:nth-child(2) {{
        background-color: transparent !important;
        color: #5C5C5C !important;
        border: 1px solid #E8E5DE !important;
        border-radius: 8px !important;
        padding: 0.75rem 1.5rem !important;
    }}
    
    .stButton > button:nth-child(2):hover {{
        border-color: #B38B59 !important;
        color: #B38B59 !important;
    }}
    
    /* Input Areas */
    .stTextArea textarea {{
        background-color: #FFFFFF;
        border: 1px solid #E8E5DE;
        border-radius: 8px;
        padding: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        color: #2C2C2C;
    }}
    
    .stTextArea textarea:focus {{
        border-color: #B38B59;
        box-shadow: 0 0 0 2px rgba(179, 139, 89, 0.1);
    }}
    
    /* Session Info */
    .session-info {{
        background: #F8F5F0;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border-left: 3px solid #B38B59;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        color: #5C5C5C;
    }}
    
    /* Status Messages */
    .status-message {{
        background: #F0F9F0;
        color: #2E5E2E;
        border: 1px solid #2E5E2E;
        border-radius: 8px;
        padding: 1rem;
        margin: 0.5rem 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
    }}
    
    .error-message {{
        background: #FEF0F0;
        color: #8B2635;
        border: 1px solid #8B2635;
    }}
    
    /* Hide Streamlit Default Elements */
    #MainMenu {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    header {{visibility: hidden;}}
    .stDeployButton {{display:none;}}
    
    /* Custom scrollbars */
    .chat-messages::-webkit-scrollbar {{
        width: 6px;
    }}
    
    .chat-messages::-webkit-scrollbar-track {{
        background: #F8F5F0;
    }}
    
    .chat-messages::-webkit-scrollbar-thumb {{
        background: #E8E5DE;
        border-radius: 3px;
    }}
    
    .article-content::-webkit-scrollbar {{
        width: 6px;
    }}
    
    .article-content::-webkit-scrollbar-track {{
        background: #F8F5F0;
    }}
    
    .article-content::-webkit-scrollbar-thumb {{
        background: #E8E5DE;
        border-radius: 3px;
    }}
    
    /* Article Content Styling */
    .article-content h2 {{
        font-family: 'Playfair Display', serif;
        color: #2C2C2C;
        border-bottom: 1px solid #E8E5DE;
        padding-bottom: 0.5rem;
        margin-top: 2rem;
    }}
    
    .article-content h3 {{
        font-family: 'Playfair Display', serif;
        color: #5C5C5C;
        margin-top: 1.5rem;
    }}
    
    .article-content p {{
        margin-bottom: 1.5rem;
    }}
    
    /* Ensure columns work properly */
    [data-testid="column"] {{
        min-height: 600px;
    }}
    </style>
    """, unsafe_allow_html=True)

# ====================
# PAGE CONFIGURATION
# ====================

st.set_page_config(
    page_title="Folio. - Your AI Editorial Board",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inject custom CSS
inject_proper_layout_css()

# ====================
# SESSION STATE MANAGEMENT
# ====================

if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "current_article" not in st.session_state:
    st.session_state.current_article = None
if "last_input" not in st.session_state:
    st.session_state.last_input = ""

# ====================
# API FUNCTIONS
# ====================

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

def edit_article(prompt, article_content):
    payload = {
        "prompt": prompt,
        "article_content": article_content,
        "session_id": st.session_state.session_id,
        "user_id": st.session_state.user_id,
    }
    response = requests.post(f"{BACKEND_URL}/api/edit", json=payload)
    return response

# ====================
# COMPONENTS
# ====================

def render_header():
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        st.markdown("""
        <div class="logo">
            Folio<span class="logo-dot">.</span>
            <div class="tagline">Your AI Editorial Board</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        if st.session_state.session_id:
            st.markdown(f"""
            <div class="session-info">
                <strong>Active Session</strong><br>
                ID: {st.session_state.session_id[:10]}...
            </div>
            """, unsafe_allow_html=True)
    
    with col3:
        if st.button("🆕 New Session", use_container_width=True, key="new_session_header"):
            st.session_state.chat_history = []
            st.session_state.current_article = None
            st.session_state.last_input = ""
            res = start_new_session()
            if res.status_code == 200:
                data = res.json()
                st.session_state.session_id = data["session_id"]
                st.session_state.user_id = data["user_id"]
                st.rerun()

def render_chat_message(role, content, timestamp):
    if role == "user":
        st.markdown(f"""
        <div class="message message-user">
            <div class="avatar avatar-user">You</div>
            <div>
                <div class="message-content">{content}</div>
                <div class="message-time">{timestamp}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        avatar_text = "AI" if role == "ai" else "Sys"
        avatar_class = "avatar-ai" if role == "ai" else "avatar-ai"
        st.markdown(f"""
        <div class="message message-ai">
            <div class="avatar {avatar_class}">{avatar_text}</div>
            <div>
                <div class="message-content">{content}</div>
                <div class="message-time">{timestamp}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

# ====================
# MAIN LAYOUT - PROPER TWO COLUMNS
# ====================

def main():
    # Header
    st.markdown('<div class="header-container">', unsafe_allow_html=True)
    render_header()
    st.markdown('</div>', unsafe_allow_html=True)

    # Actual two-column layout (this fixes the stacking)
    chat_col, article_col = st.columns([4, 6], gap="medium")

    # Left Column - Chat Panel
    with chat_col:
        st.markdown('<div class="chat-column">', unsafe_allow_html=True)
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)

        # Chat Header
        st.markdown("""
        <div class="chat-header">
            <h3 style="margin:0; color:#2C2C2C;">Editorial Board Chat</h3>
            <p style="margin:0; color:#5C5C5C; font-size:0.9rem;">Discuss and refine your content with AI editors</p>
        </div>
        """, unsafe_allow_html=True)

        # Chat Messages
        st.markdown('<div class="chat-messages">', unsafe_allow_html=True)
        for message in st.session_state.chat_history:
            render_chat_message(message["role"], message["content"], message["timestamp"])
        st.markdown('</div>', unsafe_allow_html=True)

        # Chat Input
        st.markdown('<div class="chat-input-area">', unsafe_allow_html=True)
        user_input = st.text_area(
            "Message the editorial board:",
            height=100,
            placeholder="Describe your article topic, request edits, or ask questions...",
            key="chat_input",
            label_visibility="collapsed"
        )

        col1, col2 = st.columns([3, 1])
        with col1:
            if st.session_state.current_article:
                st.selectbox(
                    "Quick actions:",
                    [
                        "Select a quick action...",
                        "Make it more concise",
                        "Expand with examples",
                        "Improve structure",
                        "Add supporting data",
                        "Change tone to formal",
                        "Change tone to conversational",
                    ],
                    key="quick_actions",
                )
        with col2:
            if st.button("📨 Send", use_container_width=True, key="send_message"):
                if user_input.strip():
                    user_message = {
                        "role": "user",
                        "content": user_input,
                        "timestamp": datetime.now().strftime("%H:%M"),
                    }
                    st.session_state.chat_history.append(user_message)
                    st.session_state.last_input = user_input
                    st.session_state.chat_history.append({
                        "role": "ai",
                        "content": "🤔 The editorial board is reviewing your request...",
                        "timestamp": datetime.now().strftime("%H:%M"),
                    })
                    response = (
                        edit_article(user_input, st.session_state.current_article)
                        if st.session_state.current_article
                        else generate_article(user_input)
                    )
                    st.session_state.chat_history.pop()
                    if response.status_code == 200:
                        data = response.json()
                        st.session_state.session_id = data["session_id"]
                        st.session_state.user_id = data["user_id"]
                        st.session_state.current_article = data["output"]
                        st.session_state.chat_history.append({
                            "role": "ai",
                            "content": "✅ Your article has been updated. Check the preview panel for changes.",
                            "timestamp": datetime.now().strftime("%H:%M"),
                        })
                    else:
                        st.session_state.chat_history.append({
                            "role": "system",
                            "content": f"❌ Error: {response.text}",
                            "timestamp": datetime.now().strftime("%H:%M"),
                        })
                    st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    # Right Column - Article Panel
    with article_col:
        st.markdown('<div class="article-column">', unsafe_allow_html=True)
        st.markdown('<div class="article-container">', unsafe_allow_html=True)
        st.markdown("""
        <div class="article-header">
            <h3 style="margin:0; color:#2C2C2C;">Article Preview</h3>
            <p style="margin:0; color:#5C5C5C; font-size:0.9rem;">Your refined content appears here</p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="article-content">', unsafe_allow_html=True)
        if st.session_state.current_article:
            article_data = st.session_state.current_article
            try:
                parsed = json.loads(article_data)
                if "article_text" in parsed:
                    st.markdown(parsed["article_text"])
                    if "image_base64" in parsed:
                        st.markdown("---")
                        st.markdown("#### Generated Illustration")
                        img_data = base64.b64decode(parsed["image_base64"])
                        image = Image.open(io.BytesIO(img_data))
                        st.image(image, use_column_width=True)
                else:
                    st.markdown(article_data)
            except json.JSONDecodeError:
                st.markdown(article_data)
        else:
            st.markdown("""
            <div style="text-align: center; padding: 4rem 2rem; color: #8C8C8C;">
                <h3>No Article Yet</h3>
                <p>Start a conversation with the editorial board to generate your first article.</p>
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    if len(st.session_state.chat_history) == 0:
        st.session_state.chat_history.append({
            "role": "ai",
            "content": "👋 Welcome to Folio! I'm your AI editorial board. Tell me what you'd like to write about.",
            "timestamp": datetime.now().strftime("%H:%M"),
        })
        st.rerun()


if __name__ == "__main__":
    main()