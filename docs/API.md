# RecruitIQ AI — API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive docs: `http://localhost:8000/docs`

---

## Endpoints

### POST /upload-jd

Upload or paste a job description for AI parsing.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | No | PDF, DOCX, or TXT |
| text | string | No | Manual JD text |

**Response:** Parsed job description with structured fields and confidence scores.

---

### POST /upload-cvs

Batch upload candidate CVs for async processing.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| job_description_id | UUID | Yes |
| files | File[] | Yes |

**Response:**
```json
{
  "job_id": "uuid",
  "message": "Processing 25 CVs",
  "total": 25
}
```

---

### GET /processing/{job_id}

Poll async processing job status.

**Response:**
```json
{
  "id": "uuid",
  "job_type": "cv_upload",
  "status": "processing",
  "progress": 10,
  "total_items": 25,
  "message": "Processed 10/25 CVs"
}
```

---

### POST /rank-candidates

Rank all candidates against the active job description using semantic matching.

**Body:**
```json
{
  "job_description_id": "uuid"
}
```

**Scoring Formula:**
- 40% Skill Match
- 25% Experience Match
- 15% Domain Match
- 10% Education Match
- 10% Soft Skill Match

---

### GET /candidates

List candidates with search, filter, sort, and pagination.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| job_description_id | UUID | Filter by JD |
| search | string | Search name/email |
| min_score | float | Minimum overall score |
| hidden_gems_only | bool | Filter hidden gems |
| sort_by | string | rank, score, name, experience |
| page | int | Page number (default 1) |
| page_size | int | Items per page (default 20) |

---

### GET /candidate/{id}

Full candidate profile with scores, explanation, and interview questions.

---

### GET /analytics

Dashboard analytics and chart data.

**Query:** `job_description_id` (optional)

---

### POST /generate-questions

Generate personalized interview questions for a candidate.

**Body:**
```json
{
  "candidate_id": "uuid"
}
```

---

### POST /generate-report

Generate PDF candidate report.

**Body:**
```json
{
  "candidate_id": "uuid"
}
```

**Response:** PDF file download.

---

### GET /export/csv

Export candidate rankings as CSV.

---

### GET /export/pdf

Export ranked candidate pool as a PDF summary report.

**Query:** `job_description_id` (optional)

**Response:** PDF file download.

---

### POST /chat

Recruiter copilot chat with RAG over candidate data.

**Body:**
```json
{
  "message": "Show strongest Python candidates",
  "session_id": "default",
  "job_description_id": "uuid"
}
```

---

### POST /compare

Compare multiple candidates side-by-side.

**Body:**
```json
{
  "candidate_ids": ["uuid1", "uuid2"],
  "job_description_id": "uuid"
}
```

---

### POST /hiring-recommendation

One-click AI hiring recommendation.

**Query:** `job_description_id`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid input or missing required fields |
| 404 | Resource not found |
| 429 | Rate limit exceeded |

## Authentication

Currently open for demo/evaluation. Production deployment should add JWT or API key auth.
