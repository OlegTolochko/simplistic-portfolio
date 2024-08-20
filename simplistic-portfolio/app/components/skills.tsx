"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { skills_images } from "@/app/constants/project_constants";

const Skills = () => {
    return (<>
            <div className="container mx-auto pt-20" id="skills">
                <div className="flex items-center justify-end">
                    <span className="text-3xl md:text-5xl font-black whitespace-nowrap">Skills
                        <span className="text-blue-500 dark:text-blue-500">.</span>
                    </span>
                    <div className="flex-grow h-0.5 ml-2 bg-sand-900"></div>
                </div>
            </div>
            <div
             className="relative flex justify-center flex-wrap sm:grid sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 mt-[20px] gap-2 pb-20">
                {skills_images.map((skill, index) => (
                    <motion.div
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    >
                    <motion.div
                        key={index}
                        style={{backgroundColor: skill.bgColor}}
                        className="sm:w-full sm:h-full w-[100px] h-[100px] aspect-square group relative transition-all rounded-xl"
                        initial={{ scale: 0.8 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * (index * 0.1), duration: 0.2 }}
                    >
                            <Image 
                            className="rounded-md transition-all ease-in-out group-hover:z-10 scale-[0.65]"
                            src={skill.url} 
                            alt={skill.title} 
                            fill
                            />
                            <div className="group-hover:scale-100 scale-50 group-hover:opacity-100 group-hover:bg-sand-140 rounded-md px-2 opacity-0 absolute bottom-2 -right-1 block shadow-lg border border-base-300 group-hover:z-20 text-sm transition-all">
                                {skill.title}
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default Skills;