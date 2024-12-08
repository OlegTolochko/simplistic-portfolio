"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { education_list } from "../constants/project_constants";

const Education = () => {
    return (
        <div className="container mx-auto" id="education">
            <div className="pt-20">
                <div className="flex items-center justify-end">
                    <span className="text-3xl md:text-5xl font-black whitespace-nowrap">Education
                        <span className="text-blue-500 dark:text-blue-500">.</span>
                    </span>
                    <div className="flex-grow h-0.5 ml-2 bg-sand-900"></div>
                </div>
            </div>
            {education_list.map((education, index) => (
                <div className="py-5 flex flex-row gap-4 max-w-full"
                key={index}
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-1 h-full bg-sand-500 absolute left-1/2 transform -translate-x-1/2"></div>
                        <div className="w-4 h-4 bg-sand-500 rounded-full relative z-10"></div>
                    </div>
                    <div className="flex-grow">
                        <div className="font-bold text-xl">
                            {education.location}
                        </div>
                        <div>{education.education_type}</div>
                        <div className="text-sand-900">
                            {education.date}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Education;