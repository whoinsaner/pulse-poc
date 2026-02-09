"""
PyMuPDF PDF Text Extraction Microservice

A lightweight FastAPI service that extracts text from PDF files using PyMuPDF (fitz).
Designed to be deployed as a containerized service (Cloud Run, Railway, etc.)
and called from the script-parser-stream edge function.

Usage:
  POST /extract-pdf
  Body: { "pdf_base64": "<base64-encoded-pdf>" }
  Returns: { "text": "...", "page_count": 12, "chars_per_page": [...], "quality": "good" }
"""

import base64
import io
import re
from typing import Optional

import fitz  # PyMuPDF
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PDF Text Extractor", version="1.0.0")

# CORS - restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    pdf_base64: str


class ExtractResponse(BaseModel):
    text: str
    page_count: int
    chars_per_page: list[int]
    quality: str  # "good", "fair", "poor"
    blank_pages: list[int]


def clean_extracted_text(text: str) -> str:
    """Clean up extracted text while preserving screenplay/comic formatting."""
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    
    # Remove excessive blank lines (more than 2 consecutive)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    
    # Remove trailing whitespace from lines
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)
    
    # Remove null bytes and other control characters (keep newlines and tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    
    return text.strip()


def assess_quality(chars_per_page: list[int], total_chars: int, page_count: int) -> str:
    """Assess extraction quality based on character distribution."""
    if page_count == 0:
        return "poor"
    
    avg_chars = total_chars / page_count
    blank_count = sum(1 for c in chars_per_page if c < 50)
    blank_ratio = blank_count / page_count
    
    if avg_chars > 500 and blank_ratio < 0.1:
        return "good"
    elif avg_chars > 200 and blank_ratio < 0.3:
        return "fair"
    else:
        return "poor"


@app.post("/extract-pdf", response_model=ExtractResponse)
async def extract_pdf(request: ExtractRequest):
    """Extract text from a base64-encoded PDF using PyMuPDF."""
    try:
        # Decode base64 PDF
        try:
            pdf_bytes = base64.b64decode(request.pdf_base64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 encoding")
        
        # Open PDF with PyMuPDF
        doc = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
        
        page_texts: list[str] = []
        chars_per_page: list[int] = []
        blank_pages: list[int] = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Extract text with layout preservation
            # "text" mode gives good line-by-line extraction
            page_text = page.get_text("text")
            
            # Track stats
            char_count = len(page_text.strip())
            chars_per_page.append(char_count)
            
            if char_count < 50:
                blank_pages.append(page_num + 1)
            
            # Add page marker (matches edge function format)
            page_texts.append(f"--- PAGE {page_num + 1} ---\n{page_text}")
        
        doc.close()
        
        # Combine all pages
        full_text = "\n\n".join(page_texts)
        full_text = clean_extracted_text(full_text)
        
        total_chars = len(full_text)
        page_count = len(page_texts)
        quality = assess_quality(chars_per_page, total_chars, page_count)
        
        return ExtractResponse(
            text=full_text,
            page_count=page_count,
            chars_per_page=chars_per_page,
            quality=quality,
            blank_pages=blank_pages,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "extractor": "pymupdf", "version": fitz.version}
