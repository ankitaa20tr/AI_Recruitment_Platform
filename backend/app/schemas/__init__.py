from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class ParsedJD(BaseModel):
    role: str = ""
    seniority: str = ""
    experience_required: str = ""
    hard_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    must_have: list[str] = Field(default_factory=list)
    nice_to_have: list[str] = Field(default_factory=list)
    domain_knowledge: list[str] = Field(default_factory=list)
    education_requirements: list[str] = Field(default_factory=list)


class ParsedCV(BaseModel):
    name: str = "Unknown"
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    education: list[dict] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    companies: list[str] = Field(default_factory=list)
    projects: list[dict] = Field(default_factory=list)
    years_of_experience: float = 0.0
    achievements: list[str] = Field(default_factory=list)
    tenure_history: list[dict] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    overall_score: float = 0.0
    skill_score: float = 0.0
    experience_score: float = 0.0
    domain_score: float = 0.0
    education_score: float = 0.0
    soft_skill_score: float = 0.0


class Explanation(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    potential: list[str] = Field(default_factory=list)
    summary: str = ""


class JDResponse(BaseModel):
    id: UUID
    title: str
    parsed_data: dict
    confidence_scores: dict
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateListItem(BaseModel):
    id: UUID
    rank: Optional[int] = None
    name: str
    overall_score: float = 0.0
    years_of_experience: float = 0.0
    top_skills: list[str] = Field(default_factory=list)
    status: str = "processed"
    is_hidden_gem: bool = False

    class Config:
        from_attributes = True


class CandidateDetail(BaseModel):
    id: UUID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    parsed_data: dict
    years_of_experience: float
    rank: Optional[int] = None
    is_hidden_gem: bool = False
    scores: Optional[ScoreBreakdown] = None
    explanation: Optional[Explanation] = None
    executive_summary: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experiences: list[dict] = Field(default_factory=list)
    interview_questions: list[dict] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ProcessingJobResponse(BaseModel):
    id: UUID
    job_type: str
    status: str
    progress: int
    total_items: int
    message: Optional[str] = None

    class Config:
        from_attributes = True


class DiversityAlert(BaseModel):
    type: str
    severity: str
    title: str
    message: str


class AnalyticsResponse(BaseModel):
    total_cvs: int = 0
    candidates_ranked: int = 0
    hidden_gems: int = 0
    diversity_alerts: int = 0
    diversity_alert_list: list[DiversityAlert] = Field(default_factory=list)
    score_distribution: list[dict] = Field(default_factory=list)
    skill_heatmap: list[dict] = Field(default_factory=list)
    experience_distribution: list[dict] = Field(default_factory=list)
    education_breakdown: list[dict] = Field(default_factory=list)
    hiring_funnel: list[dict] = Field(default_factory=list)
    diversity_insights: dict = Field(default_factory=dict)


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    job_description_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class RankRequest(BaseModel):
    job_description_id: UUID


class GenerateQuestionsRequest(BaseModel):
    candidate_id: UUID


class GenerateReportRequest(BaseModel):
    candidate_id: UUID
    job_description_id: Optional[UUID] = None


class CompareRequest(BaseModel):
    candidate_ids: list[UUID]
    job_description_id: Optional[UUID] = None
