import Header from "./components/header";
import Body from "./components/body";
import Projects from "./components/projects";

export default function Home() {
  return (
    <main className="max-w-[1440px] mx-auto px-[40px]">
      <Header />
      <Body />
      <Projects />
    </main>
  );
}