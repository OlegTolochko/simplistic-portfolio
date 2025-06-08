"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Project from "./project";
import { project_previews } from "@/app/constants/project_constants";
import { usePortfolioContext } from "../context/ProjectContext";

const Projects = () => {
  const { isOpen, openProject } = usePortfolioContext();
  return (
    <div className=" " id="projects">
      <div className="container mx-auto pt-20">
        <div className="flex items-center justify-end">
          <span className="text-3xl md:text-5xl font-black whitespace-nowrap">
            Projects
            <span className="text-blue-500 dark:text-blue-500">.</span>
          </span>
          <div className="flex-grow h-0.5 ml-2 bg-sand-900"></div>
        </div>
      </div>
      <div className="py-5 ml-1 mr-1 md:ml-4 md:mr-4 flex flex-col md:flex-row gap-4 max-w-[100%]">
        {project_previews.map((project, index) => (
          <Project
            key={index}
            index={index}
            name={project.name}
            description={project.description}
            skills={project.skills}
            img_url={project.img_url}
            url={project.url}
            isOpen={isOpen}
            toggleOverlay={() => openProject(project.index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
