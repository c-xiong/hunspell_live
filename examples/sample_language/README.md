# Sample language

A minimal Hunspell dictionary you can copy as a starting point.

- `sample.aff` — affix file: character set, suggestion alphabet (`TRY`),
  common error patterns (`REP`), and one suffix rule (`SFX S` makes
  `hello/S` also accept `hellos`).
- `sample.dic` — word list: first line is the (approximate) entry count,
  then one word per line, optionally with affix flags after `/`.

## Try it without installing anything

Open the app, choose **"Upload my dictionary…"** in the language dropdown and
select these two files. Words like `hello`, `hellos`, `word`, `language` will
be accepted; anything else gets suggestions.

## Add it permanently (self-hosted)

1. Copy this folder to `hunspell/dicts/<your_lang_code>/`.
2. Add an entry to `dicts_config/custom_dicts_config.json`:

```json
{
  "your_lang_code": {
    "hunspell_path": "hunspell/dicts/your_lang_code",
    "language": "Your Language Name",
    "text_direction": "ltr"
  }
}
```

3. Regenerate the frontend language list and rebuild:

```bash
python scripts/update_language_options.py
```

4. Restart the server.
