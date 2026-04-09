import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";

import type { BlogPost, BlogPostMeta, ProjectEntry, ProjectMeta } from "./types";

type CollectionName = "blog" | "projects";

const CONTENT_DIRECTORIES: Record<CollectionName, string> = {
  blog: path.join(process.cwd(), "content/blog"),
  projects: path.join(process.cwd(), "content/projects"),
};

const WORDS_PER_MINUTE = 220;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function ensureString(value: unknown, field: string, entryPath: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid "${field}" in ${entryPath}: expected a non-empty string.`);
  }

  return value.trim();
}

function ensureOptionalString(value: unknown, field: string, entryPath: string) {
  if (value == null) {
    return undefined;
  }

  return ensureString(value, field, entryPath);
}

function ensureBoolean(value: unknown, field: string, entryPath: string, fallback = false) {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Invalid "${field}" in ${entryPath}: expected a boolean.`);
  }

  return value;
}

function ensureStringArray(value: unknown, field: string, entryPath: string) {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`Invalid "${field}" in ${entryPath}: expected an array of strings.`);
  }

  return value.map((item) => item.trim());
}

function ensureNumber(value: unknown, field: string, entryPath: string) {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid "${field}" in ${entryPath}: expected a number.`);
  }

  return value;
}

function ensureDateString(value: unknown, field: string, entryPath: string) {
  const dateString = ensureString(value, field, entryPath);

  if (Number.isNaN(Date.parse(dateString))) {
    throw new Error(`Invalid "${field}" in ${entryPath}: "${dateString}" is not a valid date string.`);
  }

  return dateString;
}

function validateAssetPath(value: string | undefined, field: string, entryPath: string) {
  if (!value || !value.startsWith("/")) {
    return value;
  }

  const assetPath = path.join(process.cwd(), "public", value.replace(/^\//, ""));

  if (!fs.existsSync(assetPath)) {
    throw new Error(`Invalid "${field}" in ${entryPath}: public asset "${value}" does not exist.`);
  }

  return value;
}

function validateHref(value: string | undefined, field: string, entryPath: string) {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/")) {
    return validateAssetPath(value, field, entryPath);
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol.");
    }

    return value;
  } catch {
    throw new Error(
      `Invalid "${field}" in ${entryPath}: expected an absolute http(s) URL or a public asset path.`,
    );
  }
}

function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function readEntryFile(collection: CollectionName, slug: string) {
  const absolutePath = path.join(CONTENT_DIRECTORIES[collection], slug, "index.mdx");

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing content file: ${absolutePath}`);
  }

  return {
    absolutePath,
    fileContents: fs.readFileSync(absolutePath, "utf8"),
  };
}

function parseBaseMeta(
  slug: string,
  body: string,
  data: Record<string, unknown>,
  absolutePath: string,
): Omit<BlogPostMeta, "kind" | "subtitle" | "featured"> {
  return {
    slug,
    title: ensureString(data.title, "title", absolutePath),
    summary: ensureString(data.summary, "summary", absolutePath),
    publishedAt: ensureDateString(data.publishedAt, "publishedAt", absolutePath),
    updatedAt: ensureOptionalString(data.updatedAt, "updatedAt", absolutePath),
    draft: ensureBoolean(data.draft, "draft", absolutePath, false),
    tags: ensureStringArray(data.tags, "tags", absolutePath),
    heroImage: validateAssetPath(
      ensureOptionalString(data.heroImage, "heroImage", absolutePath),
      "heroImage",
      absolutePath,
    ),
    readingTimeMinutes: estimateReadingTime(body),
  };
}

function parseBlogPost(slug: string): BlogPost {
  const { absolutePath, fileContents } = readEntryFile("blog", slug);
  const { data, content } = matter(fileContents);
  const baseMeta = parseBaseMeta(slug, content, data, absolutePath);

  return {
    ...baseMeta,
    kind: "blog",
    subtitle: ensureOptionalString(data.subtitle, "subtitle", absolutePath),
    featured: ensureBoolean(data.featured, "featured", absolutePath, false),
    body: content,
    absolutePath,
  };
}

function parseProjectEntry(slug: string): ProjectEntry {
  const { absolutePath, fileContents } = readEntryFile("projects", slug);
  const { data, content } = matter(fileContents);
  const baseMeta = parseBaseMeta(slug, content, data, absolutePath);

  return {
    ...baseMeta,
    kind: "project",
    teaser: ensureString(data.teaser, "teaser", absolutePath),
    stack: ensureStringArray(data.stack, "stack", absolutePath),
    featured: ensureBoolean(data.featured, "featured", absolutePath, false),
    order: ensureNumber(data.order, "order", absolutePath),
    repoUrl: validateHref(
      ensureOptionalString(data.repoUrl, "repoUrl", absolutePath),
      "repoUrl",
      absolutePath,
    ),
    liveUrl: validateHref(
      ensureOptionalString(data.liveUrl, "liveUrl", absolutePath),
      "liveUrl",
      absolutePath,
    ),
    cardImage: validateAssetPath(
      ensureString(data.cardImage, "cardImage", absolutePath),
      "cardImage",
      absolutePath,
    )!,
    body: content,
    absolutePath,
  };
}

function sortByPublishedAtDescending<T extends { publishedAt: string }>(entries: T[]) {
  return [...entries].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

function sortProjects(entries: ProjectEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.order != null && right.order != null && left.order !== right.order) {
      return left.order - right.order;
    }

    if (left.order != null && right.order == null) {
      return -1;
    }

    if (left.order == null && right.order != null) {
      return 1;
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

function filterDrafts<T extends { draft: boolean }>(entries: T[]) {
  if (!isProduction()) {
    return entries;
  }

  return entries.filter((entry) => !entry.draft);
}

const getAllBlogPostsCached = cache(() => {
  const slugs = ensureDirectoryExists(CONTENT_DIRECTORIES.blog);
  return sortByPublishedAtDescending(filterDrafts(slugs.map(parseBlogPost)));
});

const getAllProjectsCached = cache(() => {
  const slugs = ensureDirectoryExists(CONTENT_DIRECTORIES.projects);
  return sortProjects(filterDrafts(slugs.map(parseProjectEntry)));
});

export function getAllBlogPosts() {
  return getAllBlogPostsCached();
}

export function getBlogPostBySlug(slug: string) {
  return getAllBlogPosts().find((post) => post.slug === slug) ?? null;
}

export function getFeaturedBlogPosts(limit = 3) {
  return getAllBlogPosts()
    .filter((post) => post.featured)
    .slice(0, limit);
}

export function getAllProjects() {
  return getAllProjectsCached();
}

export function getProjectBySlug(slug: string) {
  return getAllProjects().find((project) => project.slug === slug) ?? null;
}

export function getFeaturedProjects(limit = 3) {
  return getAllProjects()
    .filter((project) => project.featured)
    .slice(0, limit);
}

export async function loadBlogPostModule(slug: string) {
  return import(`@/content/blog/${slug}/index.mdx`);
}

export async function loadProjectModule(slug: string) {
  return import(`@/content/projects/${slug}/index.mdx`);
}

export type { BlogPost, BlogPostMeta, ProjectEntry, ProjectMeta };
