# Content Authoring and Deployment Guide

This guide describes the current writing workflow for the portfolio after the MDX content-system migration.

It covers:

- where blog posts and project writeups live
- how to write normal markdown content
- how to use richer MDX blocks
- how to preview changes locally
- how to deploy the site to the Raspberry Pi

## 1) Content layout

Blog posts live here:

- `content/blog/<slug>/index.mdx`
- optional `content/blog/<slug>/data.ts`

Projects live here:

- `content/projects/<slug>/index.mdx`
- optional `content/projects/<slug>/data.ts`

Public images and static assets should live under `public/...`.

Examples:

- `content/blog/tokenization/index.mdx`
- `content/blog/mdx-playground/index.mdx`
- `content/projects/brawlai/index.mdx`

## 2) Recommended authoring style

Use **markdown first**.

That means:

- write normal prose in plain markdown
- use headings, lists, code fences, and markdown tables by default
- only introduce MDX components when a section genuinely needs more structure

This keeps the source readable and close to exportable markdown while still supporting richer article sections on the site.

## 3) Frontmatter

### Blog post frontmatter

```yaml
---
title: My Post Title
summary: One-sentence summary for cards and metadata.
subtitle: Optional slightly longer subheading.
publishedAt: "2026-04-09"
featured: false
heroImage: /project_1/brawlai_cropped.webp
tags:
  - llms
  - tokenization
---
```

Supported blog fields:

- `title` required
- `summary` required
- `publishedAt` required
- `subtitle` optional
- `featured` optional
- `draft` optional
- `updatedAt` optional
- `heroImage` optional
- `tags` optional

### Project frontmatter

```yaml
---
title: Example Project
summary: Summary used on the detail page.
teaser: Short homepage/project-card description.
publishedAt: "2026-04-09"
featured: true
order: 1
stack:
  - React
  - TypeScript
cardImage: /project_1/brawlai.webp
heroImage: /project_1/brawlai_cropped.webp
repoUrl: https://github.com/example/repo
liveUrl: https://example.com
tags:
  - full-stack
  - ai
---
```

Supported project-only fields:

- `teaser` required
- `stack` required
- `cardImage` required
- `order` optional
- `repoUrl` optional
- `liveUrl` optional

## 4) What works in normal markdown

These work without any special MDX syntax:

- headings
- paragraphs
- bullet lists
- numbered lists
- blockquotes
- fenced code blocks
- markdown tables
- links
- images such as `![caption](/path/to/image.png)`

If all you need is normal article structure, stop there.

## 5) Supported MDX components

These components are registered globally, so you can use them directly inside `index.mdx`:

- `Metric`
- `Callout`
- `Aside`
- `Figure`
- `TokenTable`
- `TokenHeatmap`

### Metric

```mdx
<Metric
  label="Core idea"
  value="Markdown first"
  detail="Use plain markdown until a richer block is clearly justified."
/>
```

### Callout

```mdx
<Callout title="Important">
  This is good for a highlighted rule or key takeaway.
</Callout>
```

### Aside

```mdx
<Aside>
  Good for extra context, caveats, or side-notes.
</Aside>
```

### Figure

```mdx
<Figure caption="Optional caption text.">
  <img src="/project_2/model_architecture.png" alt="Architecture diagram" />
</Figure>
```

### TokenTable

```mdx
<TokenTable
  columns={["Column A", "Column B"]}
  rows={[
    ["row 1", "value 1"],
    ["row 2", "value 2"],
  ]}
  caption="Optional caption"
/>
```

### TokenHeatmap

This is for richer article-specific visualizations and is easiest to use with a `data.ts` file.

```mdx
import { sampleText, sampleVariants } from "./data";

<TokenHeatmap text={sampleText} variants={sampleVariants} />
```

## 6) When to create a sibling `data.ts`

Create `data.ts` when:

- the article needs structured rows, columns, or token arrays
- keeping the data inline would make the prose file noisy
- you want the content file to remain mostly readable text

This is the preferred pattern for complex examples.

Current examples:

- `content/blog/tokenization/data.ts`
- `content/blog/mdx-playground/data.ts`

## 7) Suggested writing workflow

### New blog post

1. Create a folder:

```bash
mkdir -p content/blog/my-new-post
```

2. Add `content/blog/my-new-post/index.mdx`
3. Add frontmatter
4. Write the post in markdown
5. Add `data.ts` only if needed
6. Run a local build

### New project writeup

1. Create a folder:

```bash
mkdir -p content/projects/my-project
```

2. Add `content/projects/my-project/index.mdx`
3. Add `cardImage`, `heroImage`, `stack`, and `teaser`
4. Put assets in `public/...`
5. Run a local build

## 8) Local preview and verification

For local development:

```bash
npm install
npm run dev
```

Before pushing:

```bash
npm run build
```

That is the most important check because it validates:

- frontmatter parsing
- MDX compilation
- content loading
- static route generation
- asset-path validation

## 9) Current Raspberry Pi deployment setup

As verified on **April 9, 2026**, the live portfolio deployment is:

- host alias: `pi`
- repo path: `/home/oleg/simplistic-portfolio`
- PM2 process name: `portfolio`
- PM2 working directory: `/home/oleg/simplistic-portfolio`

Important:

- PM2 process `frontend` is **not** this portfolio
- `frontend` points to `/home/oleg/brawl-ai/frontend`
- the portfolio site is the PM2 process named `portfolio`

## 10) Recommended deployment flow

### Local machine

1. Make your content/code changes
2. Verify the build locally

```bash
npm run build
```

3. Commit and push

```bash
git add .
git commit -m "feat: add new article"
git push origin main
```

Or push your feature branch if you are still reviewing changes.

### Raspberry Pi

SSH in:

```bash
ssh pi
```

Go to the repo:

```bash
cd /home/oleg/simplistic-portfolio
```

Check status first:

```bash
git status
```

This matters because as of April 9, 2026 the Pi repo already showed a modified `package-lock.json`, so you should avoid blindly pulling over local changes.

Update the repo:

```bash
git pull origin main
```

If dependencies changed:

```bash
npm install
```

Build:

```bash
npm run build
```

Restart PM2:

```bash
pm2 restart portfolio
```

Check status:

```bash
pm2 list
pm2 logs portfolio --lines 100
```

## 11) Fast path for content-only updates

If you only changed article content and no dependencies changed, the usual Pi path is:

```bash
ssh pi
cd /home/oleg/simplistic-portfolio
git pull origin main
npm run build
pm2 restart portfolio
```

## 12) If PM2 needs to be recreated

This should not be your normal workflow, but if the process disappears:

```bash
cd /home/oleg/simplistic-portfolio
pm2 start npm --name portfolio -- run start
pm2 save
```

Only do this if `portfolio` no longer exists in PM2.

## 13) Practical advice

- Treat `npm run build` as mandatory before deployment.
- Keep article assets in `public/...` and reference them with absolute paths.
- Prefer markdown for prose and MDX only for isolated richer sections.
- Keep custom article data in `data.ts` next to the article rather than embedding large arrays directly in the prose file.
- If a block starts to become reusable, make it a component instead of repeating raw JSX.

## 14) Useful reference files

- `content/blog/mdx-playground/index.mdx`
- `content/blog/mdx-playground/data.ts`
- `content/blog/tokenization/index.mdx`
- `content/blog/tokenization/data.ts`
- `content/projects/brawlai/index.mdx`
- `components/mdx/token-table.tsx`
- `components/mdx/token-heatmap.tsx`
- `lib/content/index.ts`
