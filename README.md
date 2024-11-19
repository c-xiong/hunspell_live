# Correction Tool
## Introduction
A customized spell-checking tool powered by [Spylls](https://spylls.readthedocs.io/en/latest/).

## Prerequisites
- [Docker Desktop](https://www.docker.com/get-started)

## Getting Started
These instructions will help you set up a local development environment.

### Clone the Repository
```bash
git clone https://github.com/imred42/correction_tool.git
cd correction-tool
```

### Environment Setup
1. Create a `.env` file in the root directory
2. Add the following environment variables:
```bash
DJANGO_SECRET_KEY=your_secret_key_here
BASE_URL_DEV=http://localhost:8000
BASE_URL_PROD=https://your-production-api.com
```

### Build and Run with Docker
```bash
docker compose up --build
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Development Features
- Hot-reloading enabled for both frontend and backend
- Frontend changes reflect immediately in the browser
- Backend changes trigger automatic server restart

### Custom Dictionary Support
Add your own Hunspell dictionaries (.aff and .dic files) by following these steps:

1. Create a language folder in `/correction_tool_backend/hunspell/dicts/` using the language code as the folder name
2. Update `custom_dicts_config.json` with:
   - Language code
   - Full language name
   - Text direction
   - Path to language folder
3. Run `scripts/update_language_options.py` to generate frontend language options
4. The new language will appear in the dropdown menu in the client interface