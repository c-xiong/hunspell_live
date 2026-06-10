# Hunspell Live

[![Live Demo](https://img.shields.io/badge/live-success)](https://hunspell-live.vercel.app/)
[![Docker](https://img.shields.io/badge/docker-blue?logo=docker)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/python-3.11-blue?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)

## Introduction
Hunspell Live is an open-source customized spell-checking tool powered by [Spylls](https://spylls.readthedocs.io/en/latest/). It enables developers and linguistic researchers to perform real-time spell checking using custom Hunspell dictionaries.

## Current Status

This repository is being refactored toward a simpler open-source tool for linguists and dictionary maintainers. The target v1 experience is:

- Public demo: open the website, upload `.aff` and `.dic` files, and test a Hunspell dictionary without installing anything.
- Self-hosted research mode: run the app locally for large dictionaries, offline fieldwork, sensitive language data, or persistent replacement logs.

The current codebase still uses Django, PostgreSQL, and user authentication. The migration plan is tracked in [`REFACTOR_PLAN.md`](REFACTOR_PLAN.md).

## Planned v1 Deployment Model

The public demo will use a best-effort hosted backend on [Hugging Face Spaces CPU Basic](https://huggingface.co/docs/hub/spaces-gpus), running FastAPI in a Docker Space. Hugging Face documents CPU Basic as free hardware, and Docker Spaces support FastAPI-style services through a container exposed on `app_port: 7860`.

Important demo limits:

- The free CPU Basic Space may sleep after inactivity and restart when a visitor opens it.
- Uploaded dictionaries are session-only and may disappear after restart, rebuild, or sleep because free Spaces use [ephemeral disk storage](https://huggingface.co/docs/hub/spaces-storage).
- Replacement logging is disabled on the public demo by default.
- Do not upload sensitive or unpublished fieldwork data to the public demo.

For durable replacement logs or sensitive research data, use the self-hosted path and enable local SQLite logging.

## Prerequisites
- [Docker Desktop](https://www.docker.com/get-started)

## Getting Started 🚀

### Clone the Repository
```bash
git clone https://github.com/imred42/hunspell_live.git
cd hunspell_live
```

### Environment Setup
1. Create a `.env` file in the root directory for backend configuration
2. Add the following environment variables:
```bash
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
PGDATABASE=
PGUSER=
PGPASSWORD=
```

3. Create a `.env` file in the `frontend` directory for frontend configuration
4. Add the following environment variables:
```bash
VITE_MODE=development
VITE_API_URL_DEV=http://localhost:8080
```

> **Note:** For production builds, the frontend will automatically use the production environment variables.

### Build and Run
```bash
docker compose -f docker-compose.dev.yml up --build
```

### Adding Custom Dictionaries
To add your own Hunspell dictionaries:

1. Place your `.aff` and `.dic` files in a new directory under `/hunspell_live_backend/hunspell/dicts/[language_code]/`
2. Update `dicts_config/custom_dicts_config.json` with your language configuration:
   ```json
   {
     "language_code": {
       "name": "Full Language Name",
       "direction": "ltr",
       "path": "path/to/dictionary"
     }
   }
   ```
   > **Note:** Ensure your language directory name matches the `language_code` in your configuration.

3. Generate the frontend language options:
   ```bash
   python scripts/update_language_options.py
   ```

Your new language will now appear in the client interface dropdown menu.

## License ⚖️

Copyright 2024 [Chenfei Xiong]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
