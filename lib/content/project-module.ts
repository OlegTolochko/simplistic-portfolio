export async function loadProjectModule(slug: string) {
  return import(`@/content/projects/${slug}/index.mdx`);
}
