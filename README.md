# Folio AI Multi-Agent System

A sophisticated AI content generation system that uses Google's ADK (Agent Development Kit) to create high-quality articles through a multi-agent collaborative approach. The system combines multiple specialized AI agents to handle different aspects of content creation, from research to writing and refinement.

## Project Overview

The project consists of two main components:
- A FastAPI backend that orchestrates multiple AI agents using Google's ADK
- A React frontend that provides an interactive chat interface for article generation

### Key Features

- 🤖 Multi-agent architecture for specialized tasks
- 📝 Medium-style article generation
- 🔍 Integrated web search capabilities
- 🖼️ AI image generation for articles
- 💬 Interactive chat interface
- ⚡ Real-time streaming responses
- 🔄 Article refinement capabilities

## Backend Details

### Tech Stack

- Python 3.11+
- FastAPI
- Google ADK (Agent Development Kit)
- Google Generative AI (Gemini Models)
- Uvicorn

### Agent Architecture

1. **Extract Agent**: Analyzes user input to extract entities, URLs, and keywords
2. **Web Search Agent**: Performs Google searches to gather background information
3. **Writer Agent**: Creates engaging Medium-style articles using gathered information
4. **Refine Agent**: Improves and edits articles based on user feedback
5. **Image Generation Agent**: Creates relevant AI images for articles

### Environment Variables

```env
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=your-google-api-key
APP_API_KEY=your-app-api-key
```

### Setup and Running

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend Details

### Tech Stack

- React 19.1
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Markdown

### Key Components

- **ChatPanel**: Main interface for user interaction
- **ArticlePanel**: Displays and manages generated articles
- **MessageList**: Handles chat history and agent responses
- **InputArea**: User input interface

### Environment Variables

```env
VITE_API_BASE_URL=your-backend-url
VITE_APP_API_KEY=same-as-backend-api-key
```

### Setup and Running

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Google Cloud Run Deployment

### Backend Deployment

1. Build the container:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/folio-backend
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy folio-backend \
  --image gcr.io/PROJECT_ID/folio-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=your-key,APP_API_KEY=your-key"
```

### Frontend Deployment

1. Build the container:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/folio-frontend
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy folio-frontend \
  --image gcr.io/PROJECT_ID/folio-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="VITE_API_BASE_URL=https://backend-url,VITE_APP_API_KEY=your-key"
```

## Development Notes

- The backend uses FastAPI's middleware for API key validation
- CORS is configured to allow specific origins
- The frontend implements real-time streaming of agent outputs
- Local storage is used to persist chat history
- The system supports both desktop and mobile interfaces
- All agents use Gemini 2.5 models with varying configurations

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request