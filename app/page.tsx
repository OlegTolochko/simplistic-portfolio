import Header from "./components/header";
import Body from "./components/body";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Education from "./components/education";
import Bottom from "./components/bottom";
import Experience from "./components/experience";
import { getFeaturedProjects } from "@/lib/content";

export default function Home() {
  const featuredProjects = getFeaturedProjects(3).map((project) => ({
    slug: project.slug,
    name: project.title,
    description: project.teaser,
    skills: project.stack,
    img_url: project.cardImage,
  }));

  return (
    <main className="max-w-[1440px] mx-auto px-[30px]">
      <Header />
      <Body />
      <Projects projects={featuredProjects} />
      <Education />
      <Experience />
      <Skills />
      <Bottom />
    </main>
  );
}
