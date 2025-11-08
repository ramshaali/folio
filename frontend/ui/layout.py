import streamlit as st

PRIMARY_FONT = "Merriweather, serif"
UI_FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"

def init_page():
    st.set_page_config(page_title="Folio.", layout="wide", initial_sidebar_state="collapsed")
    with open("styles/theme.css", "r", encoding="utf-8") as f:
        css = f.read()
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)

def top_header():
    cols = st.columns([0.12, 0.78, 0.1])
    with cols[0]:
        st.markdown("<div class='logo-slot'></div>", unsafe_allow_html=True)
    with cols[1]:
        st.markdown("<h1 class='brand'>Folio.<span class='tagline'>Editorial AI</span></h1>", unsafe_allow_html=True)
    with cols[2]:
        st.markdown("<div style='text-align:right;'><button class='icon-btn' title='Publish'>&#x1F4E4;</button></div>", unsafe_allow_html=True)

def two_column_layout(left_weight: float = 0.45, right_weight: float = 0.55):
    cols = st.columns([left_weight, right_weight], gap="large")
    return cols[0], cols[1]
