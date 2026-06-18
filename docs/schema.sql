-- RecruitIQ AI Database Schema
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Role',
    raw_text TEXT NOT NULL DEFAULT '',
    file_path VARCHAR(512),
    parsed_data JSONB NOT NULL DEFAULT '{}',
    confidence_scores JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    raw_text TEXT NOT NULL DEFAULT '',
    file_path VARCHAR(512),
    parsed_data JSONB NOT NULL DEFAULT '{}',
    years_of_experience FLOAT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'processed',
    is_hidden_gem BOOLEAN NOT NULL DEFAULT FALSE,
    rank INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'technical'
);

CREATE TABLE candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '',
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    description TEXT
);

CREATE TABLE candidate_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,
    overall_score FLOAT NOT NULL DEFAULT 0,
    skill_score FLOAT NOT NULL DEFAULT 0,
    experience_score FLOAT NOT NULL DEFAULT 0,
    domain_score FLOAT NOT NULL DEFAULT 0,
    education_score FLOAT NOT NULL DEFAULT 0,
    soft_skill_score FLOAT NOT NULL DEFAULT 0,
    explanation JSONB NOT NULL DEFAULT '{}',
    executive_summary TEXT
);

CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL
);

CREATE TABLE diversity_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    alerts JSONB NOT NULL DEFAULT '[]',
    insights JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    total_items INTEGER NOT NULL DEFAULT 0,
    message VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidates_jd ON candidates(job_description_id);
CREATE INDEX idx_candidates_rank ON candidates(rank);
CREATE INDEX idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX idx_chat_history_session ON chat_history(session_id);
