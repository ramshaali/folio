import streamlit as st
import json, base64
from io import BytesIO
from PIL import Image

class ChatPanel:
    def __init__(self, api): self.api = api
    def render(self):
        st.markdown("<h2 class='section-title'>Conversation</h2>", unsafe_allow_html=True)
        prompt = st.text_area("Enter a topic or prompt", key="user_prompt", height=120)
        if st.button("Run Agents"): self._send(prompt)
    def _send(self, prompt):
        if not prompt.strip(): return st.warning("Please enter a prompt")
        resp = self.api.generate(prompt)
        if resp.ok: st.session_state.article = resp.json().get("output", "")
        else: st.error("API error")

class ArticlePanel:
    def __init__(self, api): self.api = api
    def render(self):
        st.markdown("<h2 class='section-title'>Article Editor</h2>", unsafe_allow_html=True)
        content = st.text_area("Article", value=st.session_state.get("article", ""), height=300)
        if st.button("Publish"): st.success("Published!")
        st.markdown(content)

class SessionControls:
    def __init__(self, api): self.api = api
    def render(self):
        st.write("---")
        if st.button("New Session"): self.api.new_session()
