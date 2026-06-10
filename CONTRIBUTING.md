# Contributing

Thanks for your interest! The most valuable contributions right now:

- **Dictionaries**: corrections to bundled dictionaries, or new languages —
  see [docs/dicts_config.md](docs/dicts_config.md) and
  [examples/sample_language/](examples/sample_language/).
- **Bug reports** with the `.aff`/`.dic` pair that triggers them (Spylls
  parse/suggestion differences from Hunspell are worth reporting upstream
  too).
- **Frontend/backend improvements** — keep the scope of this tool small: a
  dictionary testing playground, not a writing suite.

## Dev quickstart

```bash
# backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8080

# frontend
cd frontend && npm install && npm run dev
```

Before opening a PR: `npm run build` (typechecks + bundles) must pass, and
the API smoke test should work:

```bash
curl -X POST localhost:8080/api/check/ -H 'Content-Type: application/json' \
  -d '{"words":["hello","wrold"],"language":"en_US"}'
```
