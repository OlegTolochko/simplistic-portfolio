export type BaseContentMeta = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  draft: boolean;
  tags: string[];
  heroImage?: string;
  readingTimeMinutes: number;
};

export type BlogPostMeta = BaseContentMeta & {
  kind: "blog";
  subtitle?: string;
  featured: boolean;
};

export type ProjectMeta = BaseContentMeta & {
  kind: "project";
  teaser: string;
  stack: string[];
  featured: boolean;
  order?: number;
  repoUrl?: string;
  liveUrl?: string;
  cardImage: string;
};

export type BlogPost = BlogPostMeta & {
  body: string;
  absolutePath: string;
};

export type ProjectEntry = ProjectMeta & {
  body: string;
  absolutePath: string;
};
