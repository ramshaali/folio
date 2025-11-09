from pydantic import BaseModel, Field


class AgentOutput(BaseModel):
    agent_name: str = Field(description="Name of the agent producing this output.")
    article: str = Field(default="", description="Full article text if applicable; empty if the text is a question.")
    question: str = Field(default="", description="Clarifying question if applicable; empty if the text is an article.")
