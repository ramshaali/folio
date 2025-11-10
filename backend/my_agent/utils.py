from google import genai
from google.genai import types
from PIL import Image
import io
import logging
from dotenv import load_dotenv
import base64
import json
from pydantic import ValidationError
from my_agent.schemas import AgentOutput

load_dotenv()


client = genai.Client()


def google_search_custom(query: str) -> str:
    """
    Perform a grounded Google Search using Gemini's built-in tool.

    """
    # Initialize Gemini client
    client = genai.Client()
    # Define Google Search tool
    grounding_tool = types.Tool(google_search=types.GoogleSearch())

    # Configure the model to use the tool
    config = types.GenerateContentConfig(tools=[grounding_tool])

    # Run the query with Gemini model using Google Search grounding
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",  # or "gemini-2.5-flash" if your SDK supports it
        contents=f"Search the web and summarize: {query}",
        config=config,
    )

    return response.text


def generate_image_from_article(article_text: str) -> str:
    client = genai.Client()

    try:
        # Step 1: Generate image prompt
        prompt_response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                f"Generate a short but vivid prompt for an AI image generation model to visualize the following article:\n\n{article_text}\n\nPrompt:"
            ],
        )
        image_prompt = None
        for part in prompt_response.parts:
            if part.text:
                image_prompt = part.text.strip()
                break
        if not image_prompt:
            raise ValueError("Failed to generate image prompt")
        logging.info(f"Generated Image Prompt: {image_prompt}")
    except Exception as e:
        logging.error(f"Prompt generation failed: {e}")
        return json.dumps({"error": str(e), "article_text": article_text})

    try:
        # Step 2: Generate image using prompt
        image_response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[image_prompt],
        )
        image = None
        for part in image_response.parts:
            if part.inline_data:
                image = part.as_image()
                break
        if image is None:
            raise ValueError("No image data received")

        # Convert image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Return combined JSON with article text, image prompt, and base64 image
        result = {
            "article_text": article_text,
            "image_prompt": image_prompt,
            "image_base64": img_str,
        }
        return json.dumps(result)

    except Exception as e:
        logging.error(f"Image generation failed: {e}")
        return json.dumps({"error": str(e), "article_text": article_text})


async def analyze_output_with_gemini(agent_name: str, text_output: str) -> dict:
    """
    Use Gemini to classify text output into structured JSON.
    - If it's a question, populate 'question' and leave 'article' empty.
    - If it's an article, populate 'article' with full markdown text and leave 'question' empty.
    """
    prompt = f"""
You will receive a text output from an agent named '{agent_name}'.

Your task is to classify the text as either an **'article'** or a **'question'** (clarification request / instructional statement).

Classification rules:

1️⃣ It is an **article** if:
- It contains multiple paragraphs OR
- It contains narrative content, explanations, structured writing, or any long-form text.
- It has headings, sections, or paragraph-style writing.

2️⃣ It is a **question** if:
- It is a direct question.
- It is a short statement like: "I am this agent and I will help you write an article."
- It is a meta-instruction, status message, intermediate response, or anything that is not article content.
- It is a request for clarification or a prompt asking for more user input.

📝 Output rules:

If it is an article:
- Return the **full article in Markdown format**.
- Use proper heading levels, spacing, line breaks, paragraphs, lists, etc.
- Preserve all structure exactly as given.

If it is a question:
- Return ONLY the question text (or short statement requiring clarification).

Return ONLY valid JSON with this schema:

{{
  "agent_name": "{agent_name}",
  "article": "<full article text in Markdown, leave empty if it's a question>",
  "question": "<clarifying question text, leave empty if it's an article>"
}}

Do not add any extra fields.
Do not return explanations or reasoning.
Return only the JSON object.

---

Text to classify:
\"\"\"{text_output}\"\"\"
"""


    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": AgentOutput.model_json_schema(),
        },
    )

    try:
        # Validate Gemini response directly against Pydantic schema
        result = AgentOutput.model_validate_json(response.text)
        return result.dict()
    except ValidationError as e:
        # Fallback if Gemini output doesn't match schema
        return {
            "agent_name": agent_name,
            "article": "",
            "question": "",
            "text": text_output,
            "error": str(e),
        }
    except json.JSONDecodeError:
        # Handle invalid JSON case
        return {
            "agent_name": agent_name,
            "article": "",
            "question": "",
            "text": text_output,
        }



# result = generate_image_from_article("This is a test article about AI.")
# print(result)
