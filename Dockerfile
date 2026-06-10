# Production image: Hugging Face Space (Docker SDK) and self-hosted
# deployments share this single image. FastAPI serves the built frontend
# same-origin, so no CORS configuration is needed in production.

# --- Stage 1: build the frontend ---
FROM node:22-slim AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python runtime ---
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Hugging Face Spaces runs containers as uid 1000.
RUN useradd -m -u 1000 user
WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/
COPY dicts_config/ dicts_config/
COPY hunspell/dicts/ hunspell/dicts/
COPY --from=frontend-build /app/dist frontend/dist

RUN mkdir -p /code/data && chown -R user:user /code/data
USER user

EXPOSE 7860

# Single worker on purpose: the session dictionary registry (runtime
# uploads) lives in process memory and must not be sharded across workers.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
