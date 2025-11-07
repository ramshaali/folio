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
        model="gemini-2.5-flash-lite",  # or "gemini-2.5-flash" if your SDK supports it
        contents=f"Search the web and summarize: {query}",
        config=config,
    )

    return response.text