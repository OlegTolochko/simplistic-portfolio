export async function loadBlogPostModule(slug: string) {
  return import(`@/content/blog/${slug}/index.mdx`);
}
