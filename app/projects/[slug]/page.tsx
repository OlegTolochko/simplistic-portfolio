import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleShell from "@/components/mdx/article-shell";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { loadProjectModule } from "@/lib/content/project-module";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found | Oleg Tolochko",
    };
  }

  return {
    title: `${project.title} | Oleg Tolochko`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { default: Content } = await loadProjectModule(slug);
  const links = [
    project.repoUrl ? { label: "Code", href: project.repoUrl } : null,
    project.liveUrl ? { label: project.liveUrl.endsWith(".pdf") ? "PDF" : "Website", href: project.liveUrl } : null,
  ].filter((l): l is { label: string; href: string } => l !== null);

  return (
    <main>
      <ArticleShell
        title={project.title}
        summary={project.summary}
        publishedAt={project.publishedAt}
        updatedAt={project.updatedAt}
        readingTimeMinutes={project.readingTimeMinutes}
        stack={project.stack}
        heroImage={project.heroImage}
        actions={
          links.length > 0 ? (
            <p className="flex gap-5 font-[family-name:var(--mono)] text-[13px]">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-[#1c1b19] hover:border-[#2f6ea5] hover:text-[#2f6ea5]"
                >
                  {l.label} ↗
                </a>
              ))}
            </p>
          ) : null
        }
      >
        <Content />
      </ArticleShell>
    </main>
  );
}
