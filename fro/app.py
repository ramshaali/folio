import streamlit as st
from ui.layout import init_page, two_column_layout, top_header
from ui.components import ChatPanel, ArticlePanel, SessionControls
from utils.api_client import APIClient

init_page()
api = APIClient()
top_header()
left, right = two_column_layout(left_weight=0.44, right_weight=0.56)
with left:
    ChatPanel(api).render()
with right:
    ArticlePanel(api).render()
SessionControls(api).render()
