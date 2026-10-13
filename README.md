# Simplistic Portfolio

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

Personal research portfolio built with Next.js. Live: [tolochko.dev](https://tolochko.dev/)

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

- `content/site.ts` holds all homepage content: profile, publications, projects, education, positions.
- `components/home/` renders the homepage, typeset like a paper (Newsreader, booktabs table, arXiv-style margin stamp).
- `components/convex-mesh.tsx` draws the APEX thumbnail: a chair predicted by the best ShapeNet55 complete-input model, as its 512 coloured convex polytopes (WebGL2, paper-figure palette).
- `content/projects/<slug>/index.mdx` are long-form project write-ups, served at `/projects/<slug>`.
- `app/knowledge` is the knowledge map (see `scripts/sync-knowledge.mjs`).

## Generated assets

`public/assets/` is produced by `scripts/assets/assets.py`, which reads the source repositories under `~/repos`
(GF4Shape evaluation outputs, Hopkins155, the MSW simulator, figures from the ML3D, GenPC and HyperDM projects):

```bash
~/repos/ml3d-project/.venv/bin/python scripts/assets/assets.py            # everything
~/repos/ml3d-project/.venv/bin/python scripts/assets/assets.py apex thesis # single steps
```

## License

MIT, see `LICENSE`.
