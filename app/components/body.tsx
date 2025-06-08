"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github, Linkedin, ArrowDown } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import {
  welcoming_words,
  welcoming_text,
  github_username,
  linked_in_username,
  personal_image_1,
  personal_image_2,
} from "@/app/constants/project_constants";

const SocialButtons = () => {
  const github_link = "https://github.com/" + github_username;
  const linked_in_link = "https://www.linkedin.com/in/" + linked_in_username;

  return (
    <motion.div
      className="flex flex-wrap gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <motion.a
        href={linked_in_link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="flex items-center rounded-xl p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-sand-100 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Linkedin className="mr-2 w-5 h-5" color="#F3F3F0" />
          <span>{linked_in_username}</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
      </motion.a>

      <motion.a
        href={github_link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="flex items-center rounded-xl p-3 bg-gradient-to-r from-gray-800 to-black text-sand-100 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Github className="mr-2 w-5 h-5" color="#F3F3F0" />
          <span>{github_username}</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
      </motion.a>
    </motion.div>
  );
};

const Body = () => {
  return (
    <div className="relative py-0 pt-6 lg:pt-0 " id="body">
      <div className="absolute inset-"></div>
      <div className="container mx-auto pt-20 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <motion.div
            className="flex-1 relative lg:pr-12 lg:max-w-[55%]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <TypewriterEffectSmooth words={welcoming_words} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-6 mb-8"
              >
                <p className="text-lg leading-relaxed font-normal text-gray-700 mb-6">
                  {welcoming_text}
                </p>

                <div className="text-blue-600 dark:text-blue-500 font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Let&apos;s connect!
                </div>
              </motion.div>

              <SocialButtons />
            </div>
          </motion.div>

          <motion.div
            className="relative lg:w-[45%] lg:h-[500px] flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-sand-200 rounded-full opacity-20 blur-3xl scale-110"></div>

            <motion.div
              className="w-2/5 lg:w-2/5 z-20 relative"
              whileHover={{ scale: 1.05, rotate: -12 }}
              initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
              whileInView={{ scale: 1, opacity: 1, rotate: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative group">
                <Image
                  src={personal_image_1}
                  width={300}
                  height={300}
                  alt="Personal photo"
                  className="rounded-3xl border-4 border-sand-500 shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
                />
              </div>
            </motion.div>

            <motion.div
              className="w-2/5 lg:w-2/5 mt-12 lg:mt-16 z-10 relative"
              whileHover={{ scale: 1.05, rotate: 12 }}
              initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 15 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
            >
              <div className="relative group">
                <Image
                  src={personal_image_2}
                  width={300}
                  height={300}
                  alt="Personal photo"
                  className="rounded-3xl border-4 border-sand-500 shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Body;
