"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github , Linkedin } from "lucide-react";

const SocialButtons = () => {
    return (
        <div className="flex items-center space-x-4 pt-5">
            <motion.a
                href="https://github.com/OlegTolochko"
                target="_blank"
                rel="noopener noreferrer"
                className="box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="flex items-center border-solid rounded-xl p-3 bg-black text-sand-100 text-xl">
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
                <div className="flex items-center border-solid rounded-xl p-3 bg-linkedin text-sand-100 text-xl">
                    <Linkedin className="mr-2" color="#F3F3F0" />
                    <span>oleg-tolochko</span>
                </div>
            </motion.a>
        </div>
    );
};

const Body = () => {
    return (
        <div className="py-0 px-5" id="body">
            <div className="container mx-auto pt-20">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <h1 className="text-3xl font-semibold mt-4 text-gray-500">✋ Hi I'm Oleg Tolochko!</h1>
                        <p className="text-5xl mt-2 font-bold">I develop Software.</p>
                        <SocialButtons />
                    </div>
                    
                    <motion.div 
                        className="w-1/3"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Image src="/oleg-ikea.png" width={300} height={300} alt="logo" className="rounded-3xl border-4 border-sand-300" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Body;