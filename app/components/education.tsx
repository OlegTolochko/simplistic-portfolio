"use client";
import React from "react";
import { education_list } from "../constants/project_constants";

const Education = () => {
  return (
    <div className="container mx-auto" id="education">
      <div className="pt-10">
        <div className="flex items-center justify-end">
          <span className="text-3xl md:text-5xl font-black whitespace-nowrap">
            Education
            <span className="text-blue-500 dark:text-blue-500">.</span>
          </span>
          <div className="flex-grow h-0.5 ml-2 bg-sand-900"></div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-sand-300"></div>
        
        {education_list.map((education, index) => (
          <div className="py-2 flex flex-row gap-4 max-w-full relative" key={index}>
            <div className="relative flex-shrink-0 z-10 top-1.5">
              <div className="w-4 h-4 bg-sand-700 rounded-full border-2 border-sand-400 shadow-sm"></div>
            </div>
            <div className="flex-grow">
              <div className="font-bold text-xl">{education.location}</div>
              <div className="text-black">{education.education_type}</div>
              <div className="text-sand-900 text-sm">{education.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;
