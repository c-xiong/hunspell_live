# Hunspell Live 📖

[![Live Demo](https://img.shields.io/badge/%F0%9F%A4%97%20Demo-Hugging%20Face%20Spaces-blue)](https://huggingface.co/spaces/imred42/hunspell-live)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/python-3.12-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

**Test and use Hunspell dictionaries for under-resourced languages, right in
the browser.**

Hunspell Live is an open-source playground for
[Hunspell](https://hunspell.github.io/) dictionaries, powered by
[Spylls](https://spylls.readthedocs.io/) — a readable Python reimplementation
of Hunspell. Upload your `.aff`/`.dic` pair (or pick one of 130+ bundled
dictionaries) and get live spell checking and suggestions, no installation
required.

> **Try it now: <https://imred42-hunspell-live.hf.space>** — upload your
> `.aff`/`.dic` and start testing immediately. (Also on the
> [Hugging Face Space page](https://huggingface.co/spaces/imred42/hunspell-live).
> Free tier: the Space may sleep when idle, so the first request can be slow.)

## Who is this for?

1. **Dictionary developers & linguists** — if you maintain a Hunspell
   dictionary, your testing loop is usually the `hunspell` command line.
   Here you paste real text, see what's flagged, inspect suggestions, and
   iterate: parse errors from your `.aff`/`.dic` are surfaced verbatim.
2. **Field & orthography researchers** — self-hosted instances can log
   anonymous **"error → correction"** pairs (with optional participant IDs),
   the raw material for spelling-error corpora and for the `REP` lines that
   drive Hunspell's suggestion quality.
3. **Speakers of under-resourced languages** — a usable online editor with
   spell checking for languages mainstream software ignores.

## Public demo vs. self-hosting

| | Public demo (HF Spaces) | Self-hosted |
|---|---|---|
| Setup | none | one `docker run` |
| Uploaded dictionaries | session-only (~2 h, ≤ 10 MB) | session uploads **plus** permanent languages via config |
| Replacement logging | off | opt-in, stored in local SQLite |
| Availability | best-effort, may sleep & restart | yours |
| Sensitive data | don't | stays on your machine |

The demo Space sleeps after inactivity (first request after a sleep is slow)
and its disk is ephemeral — nothing you upload is stored permanently.

## Self-hosting (the research path)

```bash
git clone https://github.com/c-xiong/hunspell_live.git
cd hunspell_live
docker build -t hunspell-live .
docker run -p 7860:7860 hunspell-live
# open http://localhost:7860
```

To record replacement data for your research:

```bash
docker run -p 7860:7860 \
  -e ENABLE_REPLACEMENT_LOGGING=true \
  -v "$PWD/data:/code/data" \
  hunspell-live
```

Export collected pairs anytime:

```
GET /api/replacements/export/?format=csv   (or ?format=json)
```

### Adding a permanent language

Put your `.aff`/`.dic` in `hunspell/dicts/<code>/`, register it in
`dicts_config/custom_dicts_config.json`, run
`python scripts/update_language_options.py`, rebuild. Full field reference in
[docs/dicts_config.md](docs/dicts_config.md), and a minimal copy-paste example
in [examples/sample_language/](examples/sample_language/).

## Development setup

Backend (FastAPI + Spylls, Python ≥ 3.10):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8080
```

Frontend (React + TypeScript + Vite + Tailwind):

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, talks to :8080
```

Or both at once: `docker compose -f docker-compose.dev.yml up`.

Interactive API docs are served at `/docs` (FastAPI's built-in OpenAPI UI).

### API overview

| Endpoint | Purpose |
|---|---|
| `POST /api/check/` | `{words: [...], language}` → which words are correct |
| `POST /api/get-list/` | suggestions for misspelled words |
| `GET /api/languages/` | available languages (drives the dropdown) |
| `POST /api/dictionaries/upload/` | upload `.aff`+`.dic`, returns a session `dictionary_id` usable as `language` |
| `POST /api/replacements/` | log an "error → correction" pair (no-op unless logging is enabled) |
| `GET /api/replacements/export/` | export logged pairs as CSV/JSON |
| `GET /health/` | health check |

### Configuration

All via environment variables (see [.env.example](.env.example)):
`ENABLE_REPLACEMENT_LOGGING`, `CORS_ORIGINS` (dev only — production serves
the frontend same-origin), `DATA_DIR`, `UPLOAD_MAX_BYTES`,
`UPLOAD_TTL_SECONDS`, `UPLOAD_MAX_SESSIONS`.

## Deployment (public demo)

The public demo runs at
[imred42/hunspell-live](https://huggingface.co/spaces/imred42/hunspell-live)
on Hugging Face Spaces (Docker SDK, CPU Basic, `app_port: 7860`).

The production image is a multi-stage build (`Dockerfile`): Node builds the
frontend, FastAPI serves it same-origin on port 7860 with a single uvicorn
worker (the session-upload registry is in-process by design). The same image
runs on the Space and self-hosted.

- Space card: [deploy/hf-space/README.md](deploy/hf-space/README.md)
- Auto-sync GitHub → Space: [.github/workflows/sync-to-hf-space.yml](.github/workflows/sync-to-hf-space.yml)
  (needs `HF_TOKEN` secret + `HF_USERNAME`/`HF_SPACE_ID` variables). The
  workflow pushes a single-commit snapshot with `.dic`/`.aff` files tracked
  via Git LFS, as Hugging Face requires for files over 10 MB — the GitHub
  repo itself needs no LFS setup.

## Privacy

- Personal dictionary and starred words live in **your browser's
  localStorage** — they are never sent to the server.
- The spell-check API receives only the word list you check.
- Replacement logging is **off by default** and clearly indicated in the
  settings panel when a self-hosted instance enables it.

## Acknowledgements

- [Spylls](https://github.com/zverok/spylls) by Victor Shepelev — the
  readable Hunspell implementation this project is a GUI for.
- Dictionary files originate from the LibreOffice/Mozilla dictionary
  collections and individual maintainers; see their respective licenses
  inside `hunspell/dicts/<code>/`.

## License

Licensed under the Apache License, Version 2.0. See the license text at
<http://www.apache.org/licenses/LICENSE-2.0>.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
