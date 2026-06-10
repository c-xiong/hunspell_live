---
title: Hunspell Live
emoji: 📖
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
short_description: Test Hunspell dictionaries for any language in your browser
tags:
  - linguistics
  - spell-check
  - hunspell
  - dictionaries
  - low-resource-languages
  - language-documentation
---

# Hunspell Live 📖

**Drop in your `.aff`/`.dic` files and test your Hunspell dictionary in the
browser — no installation, no command line.**

Built for dictionary developers, field linguists, and speakers of
under-resourced languages. Pick one of 130+ bundled dictionaries, or upload
your own work-in-progress dictionary and see live spell checking and
suggestions, powered by [Spylls](https://spylls.readthedocs.io/) (a readable
Python reimplementation of Hunspell).

## What you can do here

- ✏️ Type or paste text and check spelling against any bundled dictionary
- 📤 **Upload your own `.aff` + `.dic` pair** and test it instantly — parse
  errors are shown verbatim, which is useful feedback while you author the
  dictionary
- 💡 Click misspelled words for suggestions and apply corrections
- 🌙 Light/dark mode, mobile-friendly, RTL scripts supported

## Demo limits (please read)

This Space is a **best-effort demo**:

- It may **sleep** after inactivity and restart on the next visit — the first
  request can be slow.
- Uploaded dictionaries are **session-only** (about 2 hours, max 10 MB per
  pair) and disappear on restart. Nothing you upload is stored permanently.
- Replacement logging is **disabled**: this demo does not record your text or
  corrections.
- Don't paste sensitive or unpublished fieldwork data here.

Need persistent replacement logs ("error → correction" pairs for spelling-
error corpora and `REP` rule mining), large dictionaries, or an offline/
private instance? **Self-host it with one `docker run`** — see the
[GitHub repository](https://github.com/imred42/hunspell_live).
