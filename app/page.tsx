"use client"
import Header from "./components/header";
import Body from "./components/body";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Education from "./components/education";
import Bottom from "./bottom";
import Overlay from "./components/project_information"
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>( null);

    const toggleOverlay = (index: number) => {
        setSelectedProjectIndex(index);
        setIsOpen(!isOpen);
    };

  return (
    <main className="max-w-[1440px] mx-auto px-[30px]">
      <Header />
      <Body />
      <Projects isOpen={isOpen}
                toggleOverlay={toggleOverlay} />
      <Education />
      <Skills />
      <Bottom />
      <Overlay index={selectedProjectIndex} isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </main>
  );
}