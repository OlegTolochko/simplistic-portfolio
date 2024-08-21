import Header from "./components/header";
import Body from "./components/body";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Education from "./components/education";
import Bottom from "./bottom";

export default function Home() {
  return (
    <main className="max-w-[1440px] mx-auto px-[30px]">
      <Header />
      <Body />
      <Projects />
      <Education />
      <Skills />
      <Bottom />
    </main>
  );
}