"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Project from "./project";

const Projects = () => {
    return (
        <div className=" " id="projects">
            <div className="container mx-auto pt-20">
                <div className="flex items-center justify-end">
                    <div className="flex-grow h-0.5 bg-sand-900"></div>
                    <p className="text-5xl font-black pl-4 whitespace-nowrap">Projects</p>
                </div>
            </div>
            <div className="py-5">
                <Project 
                    name="douni2work"
                    description="Uptime/Response time-tracker for University website uni2work.de"
                    image="/oleg-ikea.png"
                    link="https://github.com/UraniumDonut"
                    skills={["React", "TypeScript", "Next.js"]}
                />
            </div>
        </div>
    );
};

export default Projects;