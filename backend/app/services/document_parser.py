import os
import uuid
import aiofiles
from pathlib import Path

import fitz  # PyMuPDF
import pdfplumber
from docx import Document

from app.config import get_settings

settings = get_settings()
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".doc"}


def validate_file_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    return ext


def validate_upload_size(content: bytes, filename: str) -> None:
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(
            f"File '{filename}' exceeds maximum upload size of {settings.max_upload_size_mb} MB"
        )


async def save_upload(file_content: bytes, filename: str) -> str:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{Path(filename).name}"
    file_path = upload_dir / safe_name
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)
    return str(file_path)


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        pass

    if not text_parts:
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()
        except Exception:
            pass

    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception:
        return ""


def extract_text_from_file(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    return ""


def extract_text_from_bytes(content: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    temp_path = upload_dir / f"temp_{uuid.uuid4()}{ext}"
    try:
        with open(temp_path, "wb") as f:
            f.write(content)
        return extract_text_from_file(str(temp_path))
    finally:
        if temp_path.exists():
            os.remove(temp_path)
