from pydantic import BaseModel, Field
from typing import TypedDict, List, Optional

class Plan(BaseModel):
    steps: List[str] = Field(description="List of steps to solve the problem")

class Code(BaseModel):
    code: str = Field(description="The Python code solving the problem")
    explanation: str = Field(description="Explanation of the code")

class Debug(BaseModel):
    fixed_code: str = Field(description="The fixed Python code")
    error_analysis: str = Field(description="Analysis of the error")

class Review(BaseModel):
    critique: str = Field(description="Critique of the code quality")
    approved: bool = Field(description="Whether the code is approved")

class AgentState(TypedDict):
    question: str
    plan: Plan
    code: Code
    debug: Debug
    review: Review
    result: str

class FeedbackRequest(BaseModel):
    message_id: int
    rating: int = Field(description="1 for thumbs up, -1 for thumbs down")
    comment: Optional[str] = None
