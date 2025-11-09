from google.adk.agents import Agent
from google.adk.agents import Agent, LlmAgent
from my_agent.utils import google_search_custom, generate_image_from_article
from google.adk.agents import SequentialAgent
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)

MODEL = "gemini-2.5-pro"

# 1️⃣ Extraction Agent
extract_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="extract_agent",
    description="Extracts entities, URLs, and topic keywords from the user's input.",
    output_key="extracted_data",
    instruction=(
        "You are the Extractor Agent. Given a user prompt, identify if it includes a website, topic, or keyword. "
        "If a link is present, extract it. If no link, extract the best keyword or phrase for searching. "
        "If no clear keyword, fallback to the full user input as the search query. "
        "**Never** delegate or transfer control to any other agent. "
        "**Always return your extraction result directly as plain text only, without any function calls or JSON formatting.**"
    )
)






# 2️⃣ Web Search Agent
web_search_tool = google_search_custom
websearch_agent = Agent(
    name="websearch_agent",
    model="gemini-2.5-flash-lite",
    description="Searches the web for background information using google search.",
    output_key="search_results",
    instruction="Use the web_search_tool to retrieve accurate, real-time info about the user's topic.",
    tools=[web_search_tool],
)


# 3️⃣ Writer Agent
writer_agent = LlmAgent(
    model="gemini-2.5-flash-lite",
    name="writer_agent",
    description="Writes an engaging, Medium-style article using the extracted prompt and search results.",
    output_key="draft_article",
    instruction=(
        "You are the Writer Agent. Given the user prompt and retrieved web content, "
        "compose a coherent, human-like Medium article with an introduction, "
        "main content, and conclusion. Maintain a professional yet creative tone."
    )
)

# 4️⃣ Refine Agent
refine_agent = LlmAgent(
    model="gemini-2.5-flash-lite",
    name="refine_agent",
    description=(
        "Edits and improves the article based on the user's instructions. "
        "Focus on enhancing tone, grammar, clarity, and flow. "
        "Follow any specific user requests for changes (e.g., add conclusion, make more formal). "
        "Do NOT call or transfer to other agents or functions."
    ),
    output_key="refined_article",
    instruction=(
        "You are the Refine Agent. When invoked, improve the provided article text "
        "by enhancing tone, grammar, clarity, and flow according to the user's instructions. "
        "Apply any user-specified edits exactly as requested. "
        "Do NOT call or transfer control to other agents or functions. "
        "Return only the fully refined article text as a plain response."
    )
)


# 5️⃣ Image Generation Agent
image_tool=generate_image_from_article
image_gen_agent = Agent(
    name="image_gen_agent",
    model="gemini-2.5-flash-lite",
    description="Generates a relevant AI image for the final article using Imagen 4.",
    instruction=(
        "You are the Image Generation Agent. Given the final article text, "
        "first create a concise but descriptive prompt that represents the article visually. "
        "Then use the generate_image_from_article tool to create one image. "
        "Return a JSON string containing article_text, image_prompt, and image_base64."
    ),
    tools=[generate_image_from_article],
)



content_agent_tool = SequentialAgent(
    name="content_creator_root_agent_sequential",
    description=(
        "You are the Root Coordinator Agent. Manage article creation by:\n"
        "1. Asking ExtractAgent to parse the prompt.\n"
        "2. Passing topic or link to WebSearchAgent to gather info via google search.\n"
        "3. Giving extracted info to WriterAgent.\n"
        "Do not stop after extract_agent — always continue the pipeline until completion."
    ),
    sub_agents=[extract_agent, websearch_agent, writer_agent],
)


# 🧠 Root Agent orchestrates the workflow
root_agent = LlmAgent(
    name="content_creator_root_agent",
    model="gemini-2.5-flash-lite",
    description=(
        "You are the Root Coordinator Agent. \n"
        "If the user wants to write a new article, delegate the task to the content_agent_tool sub-agent which returns article text.\n"
        "If the user wants to edit or refine an existing article, delegate the task to the refine_agent sub-agent, which returns only the refined article text.\n"
    ),
    sub_agents=[content_agent_tool, refine_agent],
)


#run using : adk web --log_level DEBUG
