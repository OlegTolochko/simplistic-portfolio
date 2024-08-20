"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { skills_images } from "@/app/constants/project_constants";



const UsedLibraries = () => {
    const libraries = ["React", "Next", "Tailwind", "TypeScript"];
    
    return (
      <div className="flex gap-4">
        {libraries.map((lib) => {
          const skill = skills_images.find((skill) => skill.title === lib);
          if (skill && skill.url) {
            return (
              <motion.div
                className="rounded-xl p-2"
                style={{backgroundColor: skill.bgColor}}
                key={lib}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src={skill.url}
                  alt={lib}
                  width={40}
                  height={40}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </div>  
    );
};

const Bottom = () => {
    return (
      <div className="mt-8 items-center pb-8">
        <div className="">
        <h2 className="text-l font-regular mb-4">This Website was built with:</h2>
        <UsedLibraries />
        </div>
      </div>
    );
};


export default Bottom;