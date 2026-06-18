import pytest
import numpy as np
from app.services.ai_service import cosine_similarity, AIService
from app.schemas import ParsedJD, ParsedCV, ScoreBreakdown


def test_cosine_similarity_identical():
    vec = [1.0, 2.0, 3.0]
    assert abs(cosine_similarity(vec, vec) - 1.0) < 0.001


def test_cosine_similarity_orthogonal():
    a = [1.0, 0.0]
    b = [0.0, 1.0]
    assert abs(cosine_similarity(a, b)) < 0.001


@pytest.mark.asyncio
async def test_mock_parse_jd():
    service = AIService()
    parsed, confidence = await service.parse_job_description(
        "Senior Python Developer. 5+ years. Must know FastAPI, PostgreSQL, AWS, Docker."
    )
    assert parsed.role
    assert len(parsed.hard_skills) > 0
    assert "Python" in [s.lower() for s in parsed.hard_skills] or "python" in str(parsed.hard_skills).lower()


@pytest.mark.asyncio
async def test_mock_parse_cv():
    service = AIService()
    cv_text = """John Doe
john@email.com
Senior Python Developer with 5 years experience
Skills: Python, FastAPI, PostgreSQL, AWS, Docker
"""
    parsed = await service.parse_cv(cv_text)
    assert parsed.name
    assert parsed.years_of_experience >= 0


@pytest.mark.asyncio
async def test_compute_scores():
    service = AIService()
    jd = ParsedJD(
        role="Backend Engineer",
        hard_skills=["Python", "FastAPI", "PostgreSQL"],
        must_have=["Python", "FastAPI"],
        soft_skills=["Communication"],
        experience_required="3+ years",
    )
    cv = ParsedCV(
        name="Test",
        skills=["Python", "FastAPI", "PostgreSQL", "AWS"],
        years_of_experience=5.0,
        education=[{"institution": "University", "degree": "BS"}],
    )
    jd_emb = await service.get_embedding("Python FastAPI PostgreSQL")
    cv_emb = await service.get_embedding("Python FastAPI PostgreSQL AWS")
    scores = await service.compute_scores(jd, cv, jd_emb, cv_emb)
    assert 0 <= scores.overall_score <= 100
    assert scores.skill_score > 0


@pytest.mark.asyncio
async def test_generate_explanation():
    service = AIService()
    jd = ParsedJD(role="Engineer", must_have=["Kubernetes"])
    cv = ParsedCV(name="Jane", skills=["Python"], years_of_experience=4)
    scores = ScoreBreakdown(overall_score=72, skill_score=80, experience_score=70, domain_score=65, education_score=70, soft_skill_score=60)
    explanation = await service.generate_explanation(jd, cv, scores)
    assert explanation.summary
    assert isinstance(explanation.strengths, list)


@pytest.mark.asyncio
async def test_generate_interview_questions():
    service = AIService()
    jd = ParsedJD(must_have=["AWS"])
    cv = ParsedCV(
        name="Jane",
        skills=["Python"],
        companies=["TechCo"],
        projects=[{"name": "Recommendation Engine", "description": "500k users"}],
    )
    questions = await service.generate_interview_questions(jd, cv)
    assert len(questions) > 0
    assert "question" in questions[0]
