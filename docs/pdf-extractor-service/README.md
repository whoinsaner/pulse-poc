# PDF Text Extractor Microservice

A lightweight FastAPI service using **PyMuPDF** for high-quality PDF text extraction.

## Deploy

### Google Cloud Run (recommended)
```bash
# Build and deploy
gcloud run deploy pdf-extractor \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5
```

### Railway / Render
Push this folder to a Git repo and connect it as a new service. Set the start command to:
```
uvicorn main:app --host 0.0.0.0 --port 8080
```

### Docker (local testing)
```bash
docker build -t pdf-extractor .
docker run -p 8080:8080 pdf-extractor
```

## After Deployment

1. Copy the service URL (e.g., `https://pdf-extractor-xyz.run.app/extract-pdf`)
2. Add it as the `PDF_EXTRACTOR_URL` secret in the Lovable project

## API

### `POST /extract-pdf`
```json
{
  "pdf_base64": "<base64-encoded-pdf>"
}
```

Returns:
```json
{
  "text": "--- PAGE 1 ---\nFADE IN:\n...",
  "page_count": 120,
  "chars_per_page": [1200, 980, ...],
  "quality": "good",
  "blank_pages": []
}
```

### `GET /health`
Returns service status and PyMuPDF version.
