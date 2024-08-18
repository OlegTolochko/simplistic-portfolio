"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Project from "./project";

const Projects = () => {
    return (
        <div className="py-0 px-5" id="projects">
            <div className="container mx-auto pt-20">
                <p className="text-3xl font-semibold pl-2">Projects</p>
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