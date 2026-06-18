from collections import Counter
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Candidate, DiversityReport, JobDescription
from app.schemas import AnalyticsResponse


async def get_analytics(db: AsyncSession, job_description_id: UUID | None = None) -> AnalyticsResponse:
    query = select(Candidate).options(selectinload(Candidate.scores), selectinload(Candidate.skills))
    if job_description_id:
        query = query.where(Candidate.job_description_id == job_description_id)

    result = await db.execute(query)
    candidates = list(result.scalars().all())

    total = len(candidates)
    ranked = sum(1 for c in candidates if c.rank is not None)
    hidden_gems = sum(1 for c in candidates if c.is_hidden_gem)

    diversity_alerts = 0
    diversity_alert_list: list[dict] = []
    diversity_insights = {}
    if job_description_id:
        div_result = await db.execute(
            select(DiversityReport)
            .where(DiversityReport.job_description_id == job_description_id)
            .order_by(DiversityReport.created_at.desc())
            .limit(1)
        )
        div_report = div_result.scalar_one_or_none()
        if div_report:
            diversity_alerts = len(div_report.alerts)
            diversity_alert_list = div_report.alerts or []
            diversity_insights = div_report.insights

    # Score distribution buckets
    buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for c in candidates:
        if c.scores:
            s = c.scores.overall_score
            if s <= 20:
                buckets["0-20"] += 1
            elif s <= 40:
                buckets["21-40"] += 1
            elif s <= 60:
                buckets["41-60"] += 1
            elif s <= 80:
                buckets["61-80"] += 1
            else:
                buckets["81-100"] += 1
    score_distribution = [{"range": k, "count": v} for k, v in buckets.items()]

    # Skill heatmap
    skill_counter = Counter()
    for c in candidates:
        for s in c.skills:
            skill_counter[s.skill_name] += 1
    skill_heatmap = [{"skill": sk, "count": cnt} for sk, cnt in skill_counter.most_common(15)]

    # Experience distribution
    exp_buckets = {"0-2": 0, "3-5": 0, "6-10": 0, "10+": 0}
    for c in candidates:
        y = c.years_of_experience
        if y <= 2:
            exp_buckets["0-2"] += 1
        elif y <= 5:
            exp_buckets["3-5"] += 1
        elif y <= 10:
            exp_buckets["6-10"] += 1
        else:
            exp_buckets["10+"] += 1
    experience_distribution = [{"range": k, "count": v} for k, v in exp_buckets.items()]

    # Education breakdown
    edu_counter = Counter()
    for c in candidates:
        for e in c.parsed_data.get("education", []):
            inst = e.get("institution", "Unknown") if isinstance(e, dict) else str(e)
            edu_counter[inst] += 1
    education_breakdown = [{"institution": i, "count": c} for i, c in edu_counter.most_common(10)]

    # Hiring funnel
    funnel = [
        {"stage": "Uploaded", "count": total},
        {"stage": "Processed", "count": sum(1 for c in candidates if c.status in ("processed", "ranked"))},
        {"stage": "Ranked", "count": ranked},
        {"stage": "Top 10", "count": sum(1 for c in candidates if c.rank and c.rank <= 10)},
        {"stage": "Hidden Gems", "count": hidden_gems},
    ]

    return AnalyticsResponse(
        total_cvs=total,
        candidates_ranked=ranked,
        hidden_gems=hidden_gems,
        diversity_alerts=diversity_alerts,
        diversity_alert_list=diversity_alert_list,
        score_distribution=score_distribution,
        skill_heatmap=skill_heatmap,
        experience_distribution=experience_distribution,
        education_breakdown=education_breakdown,
        hiring_funnel=funnel,
        diversity_insights=diversity_insights,
    )
