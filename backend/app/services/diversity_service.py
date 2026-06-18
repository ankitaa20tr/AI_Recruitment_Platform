from collections import Counter
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Candidate, DiversityReport, JobDescription


def analyze_diversity(candidates: list[Candidate]) -> tuple[list[dict], dict]:
    if not candidates:
        return [], {}

    alerts = []
    insights = {}

    # Educational concentration
    universities = []
    for c in candidates:
        edu = c.parsed_data.get("education", [])
        for e in edu:
            inst = e.get("institution", "") if isinstance(e, dict) else str(e)
            if inst:
                universities.append(inst)

    if universities:
        uni_counts = Counter(universities)
        total = len(universities)
        top_unis = uni_counts.most_common(2)
        if top_unis and total >= 5:
            top_pct = sum(c for _, c in top_unis) / total * 100
            if top_pct >= 60:
                uni_names = ", ".join(u for u, _ in top_unis)
                alerts.append({
                    "type": "educational_concentration",
                    "severity": "medium" if top_pct < 80 else "high",
                    "message": f"{top_pct:.0f}% of candidates originate from only {len(top_unis)} universities ({uni_names}).",
                    "title": "Diversity Alert: Educational Concentration",
                })
        insights["education_breakdown"] = [{"name": u, "count": c} for u, c in uni_counts.most_common(10)]

    # Employer concentration
    employers = []
    for c in candidates:
        for company in c.parsed_data.get("companies", []):
            if company:
                employers.append(company)

    if employers:
        emp_counts = Counter(employers)
        total_emp = len(employers)
        top_emps = emp_counts.most_common(2)
        if top_emps and total_emp >= 5:
            top_pct = sum(c for _, c in top_emps) / total_emp * 100
            if top_pct >= 50:
                emp_names = ", ".join(e for e, _ in top_emps)
                alerts.append({
                    "type": "employer_concentration",
                    "severity": "medium",
                    "message": f"{top_pct:.0f}% of candidates previously worked at {emp_names}.",
                    "title": "Diversity Alert: Employer Concentration",
                })
        insights["employer_breakdown"] = [{"name": e, "count": c} for e, c in emp_counts.most_common(10)]

    # Career path concentration
    roles = []
    for c in candidates:
        for t in c.parsed_data.get("tenure_history", []):
            if isinstance(t, dict) and t.get("role"):
                roles.append(t["role"])

    if roles:
        role_counts = Counter(roles)
        total_roles = len(roles)
        top_roles = role_counts.most_common(2)
        if top_roles and total_roles >= 5:
            top_pct = sum(c for _, c in top_roles) / total_roles * 100
            if top_pct >= 70:
                alerts.append({
                    "type": "career_path_concentration",
                    "severity": "low",
                    "message": f"{top_pct:.0f}% of candidates share similar career paths ({', '.join(r for r, _ in top_roles)}).",
                    "title": "Diversity Alert: Career Path Concentration",
                })

    return alerts, insights


def identify_hidden_gems(candidates: list[Candidate]) -> list[UUID]:
    gem_ids = []
    traditional_keywords = {"mit", "stanford", "harvard", "google", "amazon", "microsoft", "meta", "facebook"}

    for c in candidates:
        if not c.scores or c.scores.overall_score <= 80:
            continue

        edu_text = " ".join(
            str(e.get("institution", "")) if isinstance(e, dict) else str(e)
            for e in c.parsed_data.get("education", [])
        ).lower()
        emp_text = " ".join(c.parsed_data.get("companies", [])).lower()

        is_traditional = any(kw in edu_text or kw in emp_text for kw in traditional_keywords)
        if not is_traditional or c.scores.skill_score >= 75:
            gem_ids.append(c.id)

    return gem_ids


async def generate_diversity_report(db: AsyncSession, job_description_id: UUID) -> DiversityReport:
    result = await db.execute(
        select(Candidate)
        .where(Candidate.job_description_id == job_description_id)
        .options(selectinload(Candidate.scores))
    )
    candidates = list(result.scalars().all())

    alerts, insights = analyze_diversity(candidates)
    gem_ids = identify_hidden_gems(candidates)

    for c in candidates:
        c.is_hidden_gem = c.id in gem_ids

    report = DiversityReport(
        job_description_id=job_description_id,
        alerts=alerts,
        insights={**insights, "hidden_gem_count": len(gem_ids), "hidden_gem_ids": [str(i) for i in gem_ids]},
    )
    db.add(report)
    await db.flush()
    return report
