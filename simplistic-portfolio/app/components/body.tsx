"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github , Linkedin } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

const SocialButtons = () => {
    return (
        <div className="flex flex-wrap gap-4 pt-5">
            <motion.a
                href="https://github.com/OlegTolochko"
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-3 bg-black text-sand-100 text-xl">
                    <Github className="mr-2" color="#F3F3F0" />
                    <span>OlegTolochko</span>
                </div>
            </motion.a>
            
            <motion.a
                href="https://www.linkedin.com/in/oleg-tolochko"
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-3 bg-linkedin text-sand-100 text-xl">
                    <Linkedin className="mr-2" color="#F3F3F0" />
                    <span>oleg-tolochko</span>
                </div>
            </motion.a>
        </div>
    );
};

const Body = () => {
    const words = [
        {
          text: "✋",
        },
        {
          text: "Hi,",
        },
        {
          text: "I'm",
        },
        {
          text: "Oleg.",
          className: "text-blue-500 dark:text-blue-500",
        },
      ];
    
    return (
        <div className="py-0" id="body">
            <div className="container mx-auto pt-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 mb-8 md:mb-0 md:pr-8 md:max-w-[50%]">
                        <TypewriterEffectSmooth words={words} />
                        <p className="text-xl mt-4 mb-2 font-bold text-sand-900">I craft AI and data science solutions that work like a charm... most of the time. 
                            When I'm not trying to make machines smarter, I might be busy with some full-stack wizardry.</p>
                        <SocialButtons />
                    </div>
                    
                    <motion.div 
                        className="w-full md:w-1/3"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Image src="/oleg-ikea.png" width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-500" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Body;