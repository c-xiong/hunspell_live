# Dictionary configuration (`dicts_config/`)

Two JSON files drive which languages the server offers:

- `default_dicts_config.json` — the ~130 dictionaries bundled with the repo.
- `custom_dicts_config.json` — your additions; merged on top of the defaults
  (same key wins), so you can also override a bundled entry.

## Entry format

```json
{
  "wo_SN": {
    "hunspell_path": "hunspell/dicts/wo_SN",
    "language": "Wolof",
    "text_direction": "ltr"
  }
}
```

| Field | Meaning |
|---|---|
| key (`wo_SN`) | Language code used by the API (`language` parameter of `/api/check/`). Any unique string works; BCP-47-ish codes are conventional. |
| `hunspell_path` | Directory (relative to the repo root) containing exactly one matching `.aff`/`.dic` pair. The basename doesn't have to match the key. |
| `language` | Display name shown in the language dropdown. |
| `text_direction` | `ltr` or `rtl` — controls editor direction and alignment. |

## Adding a permanent language (self-hosted)

1. Put `yourlang.aff` and `yourlang.dic` in `hunspell/dicts/<code>/`.
2. Add the entry to `custom_dicts_config.json`.
3. Regenerate the frontend dropdown list:
   ```bash
   python scripts/update_language_options.py
   ```
4. Rebuild the frontend (or the Docker image) and restart.

Dictionaries load lazily on first use and stay cached in memory.

For a quick test without any of this, use **"Upload my dictionary…"** in the
app — uploads are session-scoped and need no configuration. A minimal example
you can copy lives in [`examples/sample_language/`](../examples/sample_language/).
