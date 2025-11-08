from google import genai
from google.genai import types
import logging
from dotenv import load_dotenv
load_dotenv()

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



def generate_image_from_article(article_text: str) -> dict:
    """Generate an AI image for the given article using Imagen 4."""
    client = genai.Client()

    # Step 1: Generate a descriptive image prompt
    try:
        prompt_response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=f"Generate a short but vivid prompt for an AI image generation model to visualize the following article:\n\n{article_text}\n\nPrompt:",
        )
        image_prompt = prompt_response.text.strip()
        logging.info(f"Generated Image Prompt: {image_prompt}")
    except Exception as e:
        logging.error(f"Prompt generation failed: {e}")
        return {"error": str(e)}

    # Step 2: Generate the image using Imagen
    try:
        image_response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=image_prompt,
            config=types.GenerateImagesConfig(number_of_images=1),
        )
        image_data = image_response.generated_images[0].image
        return {
            "image_prompt": image_prompt,
            "image_data": image_data,
        }
    except Exception as e:
        logging.error(f"Image generation failed: {e}")
        return {"error": str(e)}
    
    
# result = generate_image_from_article("This is a test article about AI.")
# print(result)
