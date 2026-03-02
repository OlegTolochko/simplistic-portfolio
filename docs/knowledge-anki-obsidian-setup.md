# Knowledge Graph + Anki + Obsidian setup

This guide uses a low-friction workflow:

- Anki cards: one primary concept tag (`kg::concept`)
- Optional context tags (`ctx::topic`)
- Graph structure: maintained in a dedicated JSON file
- Obsidian: optional enrichment (description, links, wiki-link relations)

## 1) Install/enable local tools

1. In Anki, install **AnkiConnect** (addon code: `2055492159`).
2. Restart Anki.
3. Keep your Obsidian vault available locally.

## 2) Recommended tagging workflow

For most cards, use exactly one concept tag:

- `kg::bert`
- `kg::relation-extraction`
- `kg::regex`

Optional context tags:

- `ctx::nlp`
- `ctx::information-extraction`

Why this is better:

- You no longer need to remember `kg1/kg2/kg3` hierarchy for each card.
- Concept identity is stable (`kg::bert` always maps to one node).
- Hierarchy is curated once in a structure file instead of repeated in every card.

Important:

- Only `kg::...` (primary concept) and optional `ctx::...` (context) are supported.
- `kg1::...`, `kg2::...`, `kg3::...` are intentionally not parsed.

## 3) Define graph structure in one file

Edit:

- `app/data/knowledge_structure.json`

This file supports:

- `concepts`: id, label, domain, parents, description, links
- `edges`: explicit cross-links (`related`, `part-of`, etc.)

Example concept:

```json
{
  "id": "bert",
  "label": "BERT",
  "domain": "deep-learning",
  "parents": ["lms", "relation-extraction"],
  "links": [
    "https://arxiv.org/abs/1810.04805 | BERT Paper"
  ]
}
```

## 4) Obsidian integration (optional)

Set:

- `OBSIDIAN_VAULT_PATH` to your vault
- `OBSIDIAN_KNOWLEDGE_DIR` (default: `Knowledge`)

Only that folder is indexed (if present), which keeps things scoped.

Per-note frontmatter options:

```yaml
---
id: bert
parents:
  - lms
  - relation-extraction
domain: deep-learning
description: Encoder-only transformer pretraining paradigm.
links:
  - https://arxiv.org/abs/1810.04805 | BERT Paper
---
```

Wiki links (`[[...]]`) become `related` edges between known concepts.

## 5) Environment variables

```bash
export OBSIDIAN_VAULT_PATH="/absolute/path/to/your/obsidian/vault"
export OBSIDIAN_KNOWLEDGE_DIR="Knowledge"
export KNOWLEDGE_STRUCTURE_PATH="/absolute/path/to/repo/app/data/knowledge_structure.json"
export ANKI_CONNECT_URL="http://127.0.0.1:8765"
export ANKI_DECK="Knowledge"
```

`KNOWLEDGE_STRUCTURE_PATH` is optional; default is `app/data/knowledge_structure.json`.

## 6) Run sync

```bash
npm run knowledge:sync
```

Dry run:

```bash
npm run knowledge:sync:dry
```

Output file:

- `app/data/knowledge_graph.json`

## 7) Practical daily flow

1. Create/review card in Anki with `kg::concept` (+ optional `ctx::...`).
2. Update concept hierarchy occasionally in `knowledge_structure.json`.
3. Optionally add richer note metadata in Obsidian `Knowledge/` notes.
4. Run sync and deploy.
