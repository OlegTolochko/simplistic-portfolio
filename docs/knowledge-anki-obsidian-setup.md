# Knowledge Graph + Anki + Obsidian setup

This guide configures your vault and decks so your site graph can sync automatically.

## 1) Install/enable local tools

1. In Anki, install **AnkiConnect** (addon code: `2055492159`).
2. Restart Anki.
3. In Obsidian, keep your vault organized in topic folders and use wiki links (`[[...]]`).

## 2) Anki structure (recommended)

Create a root deck and subdecks:

- `Knowledge::DeepLearning`
- `Knowledge::MLSystems`
- `Knowledge::Backend`
- `Knowledge::Frontend`
- `Knowledge::Infrastructure`
- `Knowledge::Math`

Tag cards with hierarchy tags (recommended):

- `kg1::deep-learning`
- `kg2::attention`
- `kg3::multi-head-latent-attention`

Why this helps:

- Builds hierarchy edges automatically: `deep-learning → attention → multi-head-latent-attention`.
- Avoids creating one node per card.
- Keeps graph scoped to actual studied concepts.

You can also use unnumbered tags (`kg::deep-learning`, `kg::attention`, `kg::multi-head-latent-attention`), but numbered tags make order explicit.

## 3) Obsidian structure (recommended)

Use one concept per note if you want note-path enrichment and optional related links. Example:

```md
# Attention

Tags: #deep-learning #transformers

Related:
- [[Cross-Attention]]
- [[Multi-Head Attention]]
- [[Linear Algebra]]
```

Conventions:

- One concept = one note.
- Link related concepts with wiki links.
- Keep concept titles stable (used for slug/id mapping).
- No Obsidian plugin is required.

## 4) Environment variables

Before sync, set:

```bash
export OBSIDIAN_VAULT_PATH="/absolute/path/to/your/obsidian/vault"
export ANKI_CONNECT_URL="http://127.0.0.1:8765"
export ANKI_DECK="Knowledge"
```

`ANKI_DECK` can be a root deck; subdecks are included by Anki query.

## 5) Run sync

```bash
npm run knowledge:sync
```

This updates:

- `app/data/knowledge_graph.json`

Dry run:

```bash
npm run knowledge:sync:dry
```

## 6) Open graph

Run app and open:

- `/knowledge-6`

Features:

- Force-directed physics graph
- Zoom/pan/drag navigation
- Node details panel
- Card due metadata per concept
- Search and domain filtering

## 7) Daily workflow suggestion

1. Capture concept in Obsidian first.
2. Add/revise cards in Anki with matching `kg::<concept-id>` tag.
3. Run `npm run knowledge:sync`.
4. Review hotspots in `/knowledge-6` (large/stale/due nodes).

---

Important behavior:

- Graph nodes are created only from Anki `kg*::` tags on cards/notes.
- Obsidian does not create extra nodes; it only enriches existing Anki-linked nodes.
