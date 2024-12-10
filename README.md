# Hunspell Live

Live demo: [Hunspell Live](https://hunspell.chenfeixiong.com/)

## Introduction
Hunspell Live is a customized spell-checking tool powered by [Spylls](https://spylls.readthedocs.io/en/latest/). It enables developers and linguistic researchers to perform real-time spell checking using custom Hunspell dictionaries.

## Prerequisites
- [Docker Desktop](https://www.docker.com/get-started)

## Getting Started 🚀

### Clone the Repository
```bash
git clone https://github.com/imred42/hunspell_live.git
cd hunspell_live
```

### Environment Setup ⚙️
1. Create a `.env` file in the root directory for backend configuration
2. Add the following environment variables:
```bash
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
PGDATABASE=
PGUSER=
PGPASSWORD=
PGHOST=
PGPORT=
```

3. Create a `.env` file in the `frontend` directory for frontend configuration
4. Add the following environment variables:
```bash
VITE_MODE=development
VITE_API_URL_DEV=http://localhost:8080
VITE_API_URL_PROD=https://hunspelllive-production.up.railway.app/
```

> **Note:** For production builds, the frontend will automatically use the production environment variables.

### Build and Run
```bash
docker compose up --build
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