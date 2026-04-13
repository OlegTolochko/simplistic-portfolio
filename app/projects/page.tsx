import Link from "next/link";
import type { Metadata } from "next";

import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects | Oleg Tolochko",
  description: "Project case studies and technical writeups.",
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Projects</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-sand-950 sm:text-5xl">
          Selected work, with enough detail to explain how it actually functions.
        </h1>
        <p className="mt-6 text-lg leading-8 text-sand-700">
          Portfolio entries are now long-form documents rather than isolated card metadata.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {projects.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-sand-600">
            No projects published yet.
          </div>
        ) : null}

        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="block rounded-[2rem] border border-sand-300 bg-sand-50 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm text-sand-600">
              <span>{formatDate(project.publishedAt)}</span>
              <span className="text-sand-400">/</span>
              <span>{project.readingTimeMinutes} min read</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-sand-950">{project.title}</h2>
            <p className="mt-3 text-base leading-7 text-sand-700">{project.teaser}</p>

            {project.stack.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-sm font-medium text-sand-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
