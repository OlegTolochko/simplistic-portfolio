"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github , Linkedin } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

const SocialButtons = () => {
    return (
        <div className="flex flex-wrap gap-4 pt-3">
            <motion.a
                href="https://www.linkedin.com/in/oleg-tolochko"
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-2 bg-blue-500 text-sand-100 text-l">
                    <Linkedin className="mr-2" color="#F3F3F0" />
                    <span>oleg-tolochko</span>
                </div>
            </motion.a>
            <motion.a
                href="https://github.com/OlegTolochko"
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-2 bg-black text-sand-100 text-l">
                    <Github className="mr-2" color="#F3F3F0" />
                    <span>OlegTolochko</span>
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
            <div className="container mx-auto pt-14">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 relative mb-8 md:mb-0 md:pr-8 md:max-w-[55%]">
                        <TypewriterEffectSmooth words={words} />
                        <span className="text-l mt-4 mb-2 font-regular text-black">I craft AI and data science solutions that work like a charm... most of the time. 
                            When I&apos;m not trying to make machines smarter, I might be busy with some full-stack wizardry.
                            </span>
                            <div className="text-blue-500 dark:text-blue-500 font-bold"> Lets connect!</div>
                        <SocialButtons />
                    </div>
                    <div className="relative md:w-[45%] md:h-[400px] flex items-center justify-center">
                    <motion.div 
                        className="w-2/5 md:w-2/5 z-10"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: -15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Image src="/oleg_professional.webp" width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-500" />
                    </motion.div>
                    <motion.div 
                        className="w-2/5 md:w-2/5 mt-8 md:mt-12"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Image src="/oleg-ikea.webp" width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-500" />
                    </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Body;