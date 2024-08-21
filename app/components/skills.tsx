"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { skills_images } from "@/app/constants/project_constants";

const Skills = () => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    return (
        <>
            <div className="container mx-auto pt-12" id="skills">
                <div className="flex items-center justify-end">
                <div className="flex-grow h-0.5 bg-sand-900"></div>
                    <span className="text-3xl md:text-5xl pl-4 font-black whitespace-nowrap">Skills
                        <span className="text-blue-500 dark:text-blue-500">.</span>
                    </span>
                </div>
            </div>
            <div className="relative flex justify-center flex-wrap sm:grid sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 mt-[20px] gap-2 pb-20">
                {skills_images.map((skill) => (
                    <motion.div
                        key={skill.title}
                        className="skill-item"
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        whileTap={{ scale: 1.2, zIndex: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            style={{backgroundColor: skill.bgColor}}
                            className="sm:w-full sm:h-full w-[100px] h-[100px] aspect-square group relative transition-all rounded-xl"
                            initial={{ scale: 0.8 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 * (skills_images.indexOf(skill) * 0.1), duration: 0.2 }}
                        >
                            <Image 
                                className="rounded-md transition-all ease-in-out group-hover:z-10 scale-[0.65]"
                                src={skill.url} 
                                alt={skill.title} 
                                fill
                                sizes="(max-width: 768px) 100px, (max-width: 1200px) 50px, 33px"
                            />
                            <div className={`group-hover:scale-100 scale-50 group-hover:opacity-100 group-hover:bg-sand-140 rounded-md px-2 opacity-0 absolute bottom-2 -right-1 block shadow-lg border border-base-300 group-hover:z-20 text-sm transition-all ${isTouchDevice ? 'touch-hover' : ''}`}>
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