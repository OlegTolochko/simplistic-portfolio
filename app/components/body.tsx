"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github , Linkedin } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import { welcoming_words, welcoming_text, github_username, linked_in_username, personal_image_1, personal_image_2 } from "@/app/constants/project_constants";


const SocialButtons = () => {
    const github_link = "https://github.com/" + github_username
    const linked_in_link = "https://www.linkedin.com/in/" + linked_in_username
    return (
        <div className="flex flex-wrap gap-4 pt-3">
            <motion.a
                href={linked_in_link}
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-2 bg-blue-500 text-sand-100 text-l">
                    <Linkedin className="mr-2" color="#F3F3F0" />
                    <span>{linked_in_username}</span>
                </div>
            </motion.a>
            <motion.a
                href={github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex border-solid rounded-xl p-2 bg-black text-sand-100 text-l">
                    <Github className="mr-2" color="#F3F3F0" />
                    <span>{github_username}</span>
                </div>
            </motion.a>
        </div>
    );
};

const Body = () => {
    
    return (
        <div className="py-0" id="body">
            <div className="container mx-auto pt-14">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 relative mb-8 md:mb-0 md:pr-8 md:max-w-[55%]">
                        <TypewriterEffectSmooth words={welcoming_words} />
                        <span className="text-l mt-4 mb-2 font-regular text-black"> {welcoming_text}
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
                        <Image src={personal_image_1} width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-500" />
                    </motion.div>
                    <motion.div 
                        className="w-2/5 md:w-2/5 mt-8 md:mt-12"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Image src={personal_image_2} width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-500" />
                    </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Body;