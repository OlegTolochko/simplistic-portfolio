"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Project from "./project";
import { project_previews } from "@/app/constants/project_constants";

const Projects = () => {
    return (
        <div className=" " id="projects">
            <div className="container mx-auto pt-20">
                <div className="flex items-center justify-end">
                    <div className="flex-grow h-0.5 bg-sand-900"></div>
                    <span className="text-3xl md:text-5xl font-black pl-4 whitespace-nowrap">Projects
                        <span className="text-blue-500 dark:text-blue-500">.</span>
                    </span>
                </div>
            </div>
            <div className="py-5 flex flex-col md:flex-row gap-4 max-w-[100%]">
                {project_previews.map((project, index) => (
                    <Project
                        key={index}
                        name={project.name}
                        description={project.description}
                        image={project.img_url}
                        link={project.url}
                        skills={project.skills}
                    />
                ))}
            </div>
        </div>
    );
};

export default Projects;