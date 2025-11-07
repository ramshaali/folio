
#https://medium.com/google-cloud/your-first-multi-agent-system-a-beginners-guide-to-building-an-ai-trend-finder-with-adk-6991cf587f22
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.



from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from google.genai import types
from google.adk.agents import Agent, LlmAgent
from google.adk.tools import function_tool
from serpapi import GoogleSearch
import os

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
    instruction=(
        "You are the Extractor Agent. "
        "Given a user prompt, identify if it includes a website, topic, or keyword. "
        "If a link is present, extract it. Otherwise, find the best keyword for searching."
    )
)
from google import genai
from google.genai import types



def google_search_custom(query: str) -> str:
    """
    Perform a grounded Google Search using Gemini's built-in tool.
    
    """
    # Initialize Gemini client
    client = genai.Client()
    # Define Google Search tool
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    # Configure the model to use the tool
    config = types.GenerateContentConfig(
        tools=[grounding_tool]
    )

    # Run the query with Gemini model using Google Search grounding
    response = client.models.generate_content(
        model="gemini-2.0-flash",  # or "gemini-2.5-flash" if your SDK supports it
        contents=f"Search the web and summarize: {query}",
        config=config,
    )

    return response.text

# ✅ FIXED TOOL DEFINITION (no function_tool wrapper)
serp_tool = google_search_custom


# 2️⃣ Web Search Agent
websearch_agent = Agent(
    name="websearch_agent",
    model="gemini-2.5-flash",
    description="Searches the web for background information using SERP API.",
    instruction="Use the serp_search_tool to retrieve accurate, real-time info about the user's topic.",
    tools=[serp_tool],
)


# 3️⃣ Writer Agent
writer_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="writer_agent",
    description="Writes an engaging, Medium-style article using the extracted prompt and search results.",
    instruction=(
        "You are the Writer Agent. Given the user prompt and retrieved web content, "
        "compose a coherent, human-like Medium article with an introduction, "
        "main content, and conclusion. Maintain a professional yet creative tone."
    )
)

# 4️⃣ Refine Agent
refine_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="refine_agent",
    description="Improves tone, grammar, clarity, and flow of the written article.",
    instruction=(
        "You are the Refine Agent. When invoked, enhance the writing quality, "
        "improving readability and ensuring smooth transitions without altering meaning."
    )
)

# 🧠 Root Agent orchestrates the workflow
root_agent = Agent(
    name="content_creator_root_agent",
    model="gemini-2.5-pro",
    description=(
        "You are the Root Coordinator Agent. Manage article creation by:\n"
        "1. Asking ExtractAgent to parse the prompt.\n"
        "2. Passing topic or link to WebSearchAgent to gather info via SERP API.\n"
        "3. Giving extracted info to WriterAgent.\n"
        "4. Optionally using RefineAgent for polish."
    ),
    sub_agents=[extract_agent, websearch_agent, writer_agent, refine_agent],
)



#run using : adk web --log_level DEBUG

