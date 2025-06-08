"use client"
import Header from "./components/header";
import Body from "./components/body";
import Projects from "./components/projects";
import Skills from "./components/skills";
import Education from "./components/education";
import Bottom from "./components/bottom";
import Overlay from "./components/project_information"
import { useState } from "react";
import Experience from "./components/experience";
import { PortfolioProvider } from "./context/ProjectContext";

export default function Home() {
  return (
    <PortfolioProvider>
      <main className="max-w-[1440px] mx-auto px-[30px]">
        <Header />
        <Body />
        <Projects />
        <Education />
        <Experience />
        <Skills />
        <Bottom />
        <Overlay />
      </main>
    </PortfolioProvider>
  );
}