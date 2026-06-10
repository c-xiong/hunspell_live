"""Hunspell Live API — FastAPI app.

Dev: `uvicorn backend.main:app --reload --port 8080` (frontend on Vite :5173,
CORS via CORS_ORIGINS). Production (Hugging Face Space / self-hosted docker):
single container, same origin — FastAPI serves the built frontend from
frontend/dist with `uvicorn backend.main:app --host 0.0.0.0 --port 7860 --workers 1`.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import CORS_ORIGINS, FRONTEND_DIST
from backend.routers import dictionaries, languages, replacements, spell

app = FastAPI(
    title="Hunspell Live API",
    description="Test Hunspell dictionaries in the browser, powered by Spylls.",
    version="1.0.0",
)

if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(spell.router)
app.include_router(replacements.router)
app.include_router(languages.router)
app.include_router(dictionaries.router)


@app.get("/health/")
def health_check():
    return {"status": "ok"}


# Same-origin production serving of the built frontend. html=True makes "/"
# serve index.html; the SPA only has one route, so no catch-all is needed.
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
