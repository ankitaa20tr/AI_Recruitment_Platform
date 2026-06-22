# Assignment 5: AI-Augmented Recruitment Platform

**Screen 1,000 CVs. Surface the 10 who matter. Explain why.**

| Assignment | Category | Group Size | Marks |
|------------|----------|------------|-------|
| #5 of 15 | HR AI | 5 Students | 15 + 3 Bonus |

---

## Problem Statement

Recruiters are drowning in volume. ATS keyword matching is brittle — it rejects great candidates and passes keyword-stuffed CVs. This platform goes **beyond keyword matching** to semantic understanding of fit, and explains ranking decisions transparently.

---

## What You're Building

A recruitment augmentation platform (**RecruitIQ AI**) with:

- **JD ingestion** — upload or paste any job description format
- **CV batch upload** — PDF, DOCX, and TXT in one batch
- **AI semantic ranking** — weighted score breakdown by requirement category
- **Explainable rankings** — per-candidate written justification
- **Bias & diversity flagging** — homogeneous shortlist detection + hidden gems
- **Interview question generation** — tailored to each candidate's CV and gaps

---

## Core Features → Implementation Map

| Core Feature | What It Does | Backend | Frontend |
|--------------|--------------|---------|----------|
| **Job Description Parser** | Extracts hard/soft skills, experience level, domain knowledge, must-have vs nice-to-have | `ai_service.parse_job_description()` + `document_parser.py` → `POST /upload-jd` | Dashboard: upload/paste JD + **Parsed Job Requirements** panel |
| **CV Ingestion & Parsing** | Batch upload PDF/DOCX/TXT; extract experience, skills, education, tenure, career trajectory | Background task in `api.py` → `save_parsed_candidate()` | Dashboard: multi-file upload with progress polling |
| **Semantic Candidate Scoring** | Score candidates semantically (not keyword-only); rank with category breakdown | `ranking_service.rank_candidates()` + `ai_service.compute_scores()` | Candidates table, radar charts on profile |
| **Explainable Rankings** | Per-candidate justification: fit, gaps, risks, interview focus | `ai_service.generate_explanation()` | Candidate profile: executive summary + 4-quadrant explanation |
| **Bias & Diversity Flags** | Flag homogeneous shortlists; surface high-scoring non-traditional candidates | `diversity_service.analyze_diversity()` + `identify_hidden_gems()` | Dashboard + Analytics: **Bias & Diversity Flags** panel |
| **Interview Question Generator** | Tailored questions probing background, skills, and gaps | `generate_questions_for_candidate()` → `POST /generate-questions` | Candidate profile; auto-generated for top 10 after ranking |

### Scoring Formula (Semantic, Not Keyword-Only)

```
Overall Score =
  40% Skill Match      (semantic overlap on parsed skill lists)
+ 25% Experience Match (years + tenure trajectory heuristics)
+ 15% Domain Match     (vector embedding cosine similarity)
+ 10% Education Match  (parsed education vs JD requirements)
+ 10% Soft Skill Match (parsed soft skills vs JD)
```

Embeddings use OpenAI `text-embedding-3-small` (or deterministic mock embeddings in demo mode). Domain scoring uses **vector similarity** — not raw keyword counts.

---

## Success Metrics → How We Meet Them

| Metric | Target | How to Verify |
|--------|--------|---------------|
| **Ranking accuracy** | Strongest candidates surface over weaker ones | Run seed script on 25 sample CVs; top ranks align with Senior Backend Engineer JD requirements |
| **Explanation quality** | Specific per candidate, not boilerplate | Open any candidate profile — strengths/gaps reference their companies, skills, and projects |
| **Interview questions** | Tailored to each CV | Profile page questions mention candidate employers, projects, and identified gaps |
| **Performance** | 20+ CVs in under 60 seconds | Upload all 25 files from `sample-data/cvs/`; processing completes in demo mode within ~60s |
| **Bias flag** | Triggers on skewed shortlist | After ranking, Dashboard shows educational/employer concentration alerts when pool is homogeneous |

---

## Architecture

```mermaid
flowchart LR
    subgraph ingest [Ingestion]
        JD[Job Description]
        CVs[CV Batch Upload]
    end

    subgraph parse [Parsing]
        DocParser[Document Parser\nPDF / DOCX / TXT]
        AIParse[AI Parser\nOpenAI or Demo Mock]
    end

    subgraph score [Ranking]
        Embed[Embeddings]
        Chroma[ChromaDB Vectors]
        Score[Weighted Scoring]
        Explain[Explainability]
        Diversity[Diversity Analysis]
        Questions[Interview Questions]
    end

    subgraph ui [Frontend]
        Dashboard[Dashboard]
        Candidates[Candidates]
        Analytics[Analytics]
        Copilot[Copilot]
    end

    JD --> DocParser --> AIParse
    CVs --> DocParser --> AIParse
    AIParse --> Embed --> Chroma
    AIParse --> Score --> Explain
    Score --> Diversity
    Score --> Questions
    Score --> Dashboard
    Score --> Candidates
    Diversity --> Analytics
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Next.js frontend |
| **Python** | 3.12+ | FastAPI backend |
| **PostgreSQL** | 16+ | Persistent storage |
| **OpenAI API key** | _(optional)_ | Live AI; omit for demo mode |

---

## Quick Start (Local)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd AI_Recruitment_Platform

cp .env.example .env
cp .env.local.example .env.local
```

Edit `.env` if your PostgreSQL credentials differ from the defaults.

### 2. Set up PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16

createuser -s recruitiq 2>/dev/null || true
psql postgres -c "ALTER USER recruitiq WITH PASSWORD 'recruitiq_secret';"
psql postgres -c "CREATE DATABASE recruitiq OWNER recruitiq;" 2>/dev/null || true
```

**Ubuntu / Debian:**

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER recruitiq WITH PASSWORD 'recruitiq_secret';"
sudo -u postgres psql -c "CREATE DATABASE recruitiq OWNER recruitiq;"
```

**Windows:** Install [PostgreSQL 16](https://www.postgresql.org/download/windows/), then create user `recruitiq` / database `recruitiq` via pgAdmin or `psql`.

Tables are created automatically on first backend startup via SQLAlchemy (`init_db()`). Optional manual schema: `docs/schema.sql`.

### 3. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
uvicorn backend.app.main:app --reload --port 8000
```

Verify: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"healthy"}`

### 4. Start the frontend (new terminal)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

**Demo mode** is enabled by default (`DEMO_MODE=true`). No OpenAI API key required — intelligent mock AI handles parsing, scoring, explanations, and questions for offline demos and grading.

---

## Demo Workflow (Step by Step)

Use this flow to demonstrate all assignment requirements to evaluators.

1. Open http://localhost:3000 → **Launch Dashboard**
2. Confirm the green backend connection (no red banner at top)
3. **Upload JD** — paste text or upload `sample-data/job_descriptions/senior_backend_engineer.txt`
4. Review the **Parsed Job Requirements** panel (hard skills, must-have, nice-to-have, domain)
5. **Upload CVs** — select all 25 files from `sample-data/cvs/` (`.txt` resumes)
6. Wait for the processing progress bar to complete (`GET /processing/{job_id}`)
7. Click **Rank Candidates** and wait for ranking to finish
8. Explore results:
   - **Top Ranked Candidates** table on Dashboard
   - **Bias & Diversity Flags** — concentration alerts + hidden gems
   - **Candidates** page — filter by min score, hidden gems
   - **Analytics** — score distribution, skill heatmap, hiring funnel
   - **Compare** — side-by-side 2–4 candidates
   - **Copilot** — chat over the candidate pool
9. Open a candidate profile → radar chart, explanation quadrants, **auto-generated interview questions**
10. Download CSV/PDF exports from candidate or analytics pages

### One-Command Seed (Skip Manual Upload)

With the backend running and PostgreSQL available:

```bash
cd backend && source .venv/bin/activate
cd ..
python3 scripts/seed_data.py
```

This loads the sample JD, parses all 25 CVs, runs ranking, diversity analysis, and question generation. Refresh the Dashboard to see results immediately.

---

## Environment Variables

### Backend (`.env` in project root)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://recruitiq:recruitiq_secret@localhost:5432/recruitiq` | Async PostgreSQL connection |
| `OPENAI_API_KEY` | _(empty)_ | OpenAI key; leave empty for demo mode |
| `DEMO_MODE` | `true` | Use mock AI when no API key |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins (comma-separated) |
| `CHROMA_PERSIST_DIR` | `./chroma_data` | ChromaDB vector storage path |
| `UPLOAD_DIR` | `./uploads` | Uploaded CV/JD file storage |
| `MAX_UPLOAD_SIZE_MB` | `10` | Per-file upload limit |
| `RATE_LIMIT_PER_MINUTE` | `60` | API rate limit |

### Frontend (`.env.local` in project root)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL the browser calls |

For production, set `NEXT_PUBLIC_API_URL` to your deployed backend URL and add the frontend origin to `CORS_ORIGINS`.

---

## Testing Guide

### Backend unit tests (no database required)

Tests core AI logic: parsing, scoring, explanations, interview questions.

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python3 -m pytest tests/test_services.py -v
```

Expected: **7 passed** — cosine similarity, JD/CV parsing, score computation, explanations, questions.

### Backend API tests

Health and analytics endpoints work without DB. Database-dependent endpoints require PostgreSQL running.

```bash
# With PostgreSQL running and .env configured:
python3 -m pytest tests/test_api.py -v

# Skip DB-dependent integration tests:
python3 -m pytest tests/test_api.py -v -m "not integration"
```

### Manual verification checklist (assignment success metrics)

| # | Metric | Steps | Pass criteria |
|---|--------|-------|---------------|
| 1 | Ranking accuracy | Seed data or upload 25 CVs + rank | Top 5 include strong Python/FastAPI/backend profiles (e.g. Sarah Chen, Marcus Johnson) |
| 2 | Explanation quality | Open 3 different candidate profiles | Each summary mentions candidate-specific skills, companies, or gaps — not identical text |
| 3 | Interview questions | Open top-ranked profile | Questions reference CV content (employer names, projects, skill gaps) |
| 4 | Performance | Upload 25 CVs, note processing time | Completes in under 60 seconds in demo mode |
| 5 | Bias flag | Rank full sample pool | Dashboard shows educational or employer concentration alert; hidden gems badge appears |

### Frontend build verification

```bash
npm install
npm run build    # production build + type check
npm run lint     # ESLint
```

Expected: build completes with no type errors; all 8 routes generated.

---

## Deployment Guide

No Docker required. Deploy backend, frontend, and database as separate services.

### Option A — Vercel (frontend) + Render (backend + PostgreSQL)

**1. PostgreSQL**

Create a PostgreSQL instance on [Render](https://render.com), [Neon](https://neon.tech), or [Supabase](https://supabase.com). Copy the connection string and convert to async format:

```
postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE
```

**2. Backend on Render**

- New **Web Service** → connect repo, root directory `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `DATABASE_URL`, `DEMO_MODE=true`, `CORS_ORIGINS=https://your-app.vercel.app`

**3. Frontend on Vercel**

- Import repo, framework preset **Next.js**, root directory `/` (project root)
- Environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
- Deploy

**4. Post-deploy**

- Hit `https://your-backend.onrender.com/health` — confirm healthy
- Open Vercel URL, upload a JD, verify Dashboard connects

### Option B — Single VPS (Ubuntu)

```bash
# On the server — install Node 20, Python 3.12, PostgreSQL, nginx

# Backend (systemd or screen)
cd backend && pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm install && npm run build
npm start   # or PM2: pm2 start npm --name frontend -- start

# nginx: proxy /api to :8000, / to :3000
```

Set production `.env` with real `DATABASE_URL`, `CORS_ORIGINS`, and optionally `OPENAI_API_KEY` (set `DEMO_MODE=false` for live AI).

### Production checklist

- [ ] PostgreSQL reachable from backend
- [ ] `CORS_ORIGINS` includes frontend URL
- [ ] `NEXT_PUBLIC_API_URL` points to backend (rebuild frontend after changing)
- [ ] `uploads/` and `chroma_data/` directories writable on backend host
- [ ] HTTPS enabled (Vercel/Render provide this automatically)

---

## Project Structure

```
AI_Recruitment_Platform/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry
│   │   ├── routers/api.py          # REST endpoints
│   │   ├── models/entities.py      # SQLAlchemy models
│   │   ├── schemas/                # Pydantic models
│   │   └── services/
│   │       ├── ai_service.py       # OpenAI + mock AI
│   │       ├── document_parser.py  # PDF/DOCX/TXT extraction
│   │       ├── ranking_service.py  # Ranking pipeline
│   │       ├── diversity_service.py# Bias/diversity flags
│   │       ├── analytics_service.py
│   │       ├── report_service.py   # PDF reports
│   │       └── vector_store.py     # ChromaDB
│   └── tests/
├── src/                            # Next.js 15 frontend (project root)
│   ├── app/
│   │   ├── dashboard/              # JD upload, CV batch, rank
│   │   ├── candidates/             # Searchable candidate table
│   │   ├── analytics/              # Charts + diversity flags
│   │   ├── compare/                # Side-by-side comparison
│   │   └── copilot/                # Recruiter chat
│   └── components/dashboard/
│       ├── diversity-alerts.tsx
│       └── parsed-jd-preview.tsx
├── sample-data/
│   ├── cvs/                        # 25 sample resumes
│   └── job_descriptions/
├── scripts/seed_data.py
├── docs/API.md
├── .env.example
└── package.json
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/upload-jd` | Upload or paste job description |
| `POST` | `/api/v1/upload-cvs` | Batch upload CVs (async) |
| `GET` | `/api/v1/processing/{job_id}` | Poll processing status |
| `POST` | `/api/v1/rank-candidates` | Rank all candidates for a JD |
| `GET` | `/api/v1/candidates` | List, search, filter, paginate |
| `GET` | `/api/v1/candidate/{id}` | Full profile + scores + questions |
| `GET` | `/api/v1/analytics` | Dashboard analytics + diversity alerts |
| `POST` | `/api/v1/generate-questions` | Generate interview questions |
| `POST` | `/api/v1/generate-report` | Download candidate PDF |
| `GET` | `/api/v1/export/csv` | Export ranked candidates CSV |
| `GET` | `/api/v1/export/pdf` | Export pool PDF report |
| `POST` | `/api/v1/chat` | Recruiter copilot |
| `POST` | `/api/v1/compare` | Compare 2–4 candidates |
| `POST` | `/api/v1/hiring-recommendation` | Top-3 + hidden gems |

Full docs: [docs/API.md](docs/API.md) and http://localhost:8000/docs

---

## Diversity & Ethics

- **No protected-attribute inference** — we do not infer gender, ethnicity, religion, or caste
- Flags are based on **structural signals**: university concentration, employer concentration, career path similarity
- **Hidden gems**: candidates scoring >80% with non-traditional educational or employer backgrounds
- Alerts surface on Dashboard and Analytics after ranking

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.12, FastAPI, Uvicorn |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Database | PostgreSQL 16 (SQLAlchemy 2 + asyncpg) |
| Vector Store | ChromaDB |
| AI | OpenAI `gpt-4o-mini` + `text-embedding-3-small` (demo mock when no key) |
| Documents | PyMuPDF, pdfplumber, python-docx |
| Reports | ReportLab (PDF) |

---

## Performance Targets

| Batch Size | Target | Mechanism |
|------------|--------|-----------|
| 20 CVs | < 60 seconds | Async background tasks + demo-mode mocks |
| 100 CVs | < 5 minutes | Same pipeline; live OpenAI adds latency |

Progress is polled via `GET /processing/{job_id}`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Red "Cannot reach backend" banner | Start backend: `uvicorn backend.app.main:app --reload --port 8000` |
| `connection refused` on upload | PostgreSQL not running — start service and verify `DATABASE_URL` |
| CV upload fails silently | Ensure a JD is uploaded/selected first; check file is PDF/DOCX/TXT under 10 MB |
| Empty rankings | Click **Rank Candidates** after CV processing completes |
| Seed script errors | Activate venv, ensure PostgreSQL is up, run from project root |

---

## License

Built for university evaluation and demonstration purposes.
