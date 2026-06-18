#!/usr/bin/env python3
"""Seed RecruitIQ AI with sample job descriptions and candidate CVs."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import AsyncSessionLocal, init_db
from app.services.ai_service import ai_service
from app.services.ranking_service import save_parsed_candidate, rank_candidates
from app.models import JobDescription

SAMPLE_DIR = Path(__file__).parent.parent / "sample-data"


async def seed():
    await init_db()

    jd_path = SAMPLE_DIR / "job_descriptions" / "senior_backend_engineer.txt"
    jd_text = jd_path.read_text()

    parsed_jd, confidence = await ai_service.parse_job_description(jd_text)

    async with AsyncSessionLocal() as db:
        jd = JobDescription(
            title=parsed_jd.role or "Senior Backend Engineer",
            raw_text=jd_text,
            parsed_data=parsed_jd.model_dump(),
            confidence_scores=confidence,
        )
        db.add(jd)
        await db.flush()
        jd_id = jd.id

        cv_dir = SAMPLE_DIR / "cvs"
        for cv_file in sorted(cv_dir.glob("*.txt")):
            text = cv_file.read_text()
            parsed_cv = await ai_service.parse_cv(text)
            await save_parsed_candidate(db, jd_id, text, None, parsed_cv)
            print(f"  Added: {parsed_cv.name}")

        await db.commit()

        async with AsyncSessionLocal() as db2:
            await rank_candidates(db2, jd_id)
            await db2.commit()

    print(f"\nSeed complete! Job Description ID: {jd_id}")
    print(f"Added {len(list(cv_dir.glob('*.txt')))} candidates and ranked them.")


if __name__ == "__main__":
    asyncio.run(seed())
