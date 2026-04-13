import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleShell from "@/components/mdx/article-shell";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/content";
import { loadBlogPostModule } from "@/lib/content/blog-module";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Oleg Tolochko",
    };
  }

  return {
    title: `${post.title} | Oleg Tolochko`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { default: Content } = await loadBlogPostModule(slug);

  return (
    <main>
      <ArticleShell
        title={post.title}
        summary={post.subtitle ?? post.summary}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        readingTimeMinutes={post.readingTimeMinutes}
        tags={post.tags}
        heroImage={post.heroImage}
      >
        <Content />
      </ArticleShell>
    </main>
  );
}
