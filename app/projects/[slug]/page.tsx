import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Github } from "lucide-react";

import ArticleShell from "@/components/mdx/article-shell";
import { getAllProjects, getProjectBySlug, loadProjectModule } from "@/lib/content";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function ProjectLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-sand-400 bg-sand-50 px-4 py-2 text-sm font-medium text-sand-900 transition-colors hover:bg-sand-100"
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      target={href.startsWith("http") ? "_blank" : undefined}
    >
      {icon}
      {children}
    </Link>
  );
}

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
      title: "Project Not Found | Oleg Tolochko",
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

  return (
    <main>
      <ArticleShell
        eyebrow="Projects"
        title={project.title}
        summary={project.summary}
        publishedAt={project.publishedAt}
        updatedAt={project.updatedAt}
        readingTimeMinutes={project.readingTimeMinutes}
        heroImage={project.heroImage}
        actions={
          project.liveUrl || project.repoUrl ? (
            <div className="flex flex-wrap gap-3">
              {project.liveUrl ? (
                <ProjectLink href={project.liveUrl} icon={<ArrowUpRight size={16} />}>
                  View project
                </ProjectLink>
              ) : null}
              {project.repoUrl ? (
                <ProjectLink href={project.repoUrl} icon={<Github size={16} />}>
                  View repository
                </ProjectLink>
              ) : null}
            </div>
          ) : null
        }
        preamble={
          project.stack.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-sm font-medium text-sand-700"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null
        }
      >
        <Content />
      </ArticleShell>
    </main>
  );
}
