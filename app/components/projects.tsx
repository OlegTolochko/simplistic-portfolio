"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Project from "./project";
import { project_previews } from "@/app/constants/project_constants";
import { usePortfolioContext } from "../context/ProjectContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const Projects = () => {
  const { isOpen, openProject } = usePortfolioContext();
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(500);
  
  const isPeekInView = useInView(buttonRef, { once: false, amount: 0.3 });

  const hasMoreProjects = project_previews.length > 2;
  const firstRowProjects = project_previews.slice(0, 2);
  const remainingProjects = project_previews.slice(2);

  const PEEK_HEIGHT = 128;
  const HOVER_PADDING = 48;

  useEffect(() => {
    const measureHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    measureHeight();
    
    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const expandedHeight = contentHeight + HOVER_PADDING;

  return (
    <div className=" " id="projects">
      <div className="container mx-auto pt-20">
        <div className="flex items-center justify-end">
          <span className="text-3xl md:text-5xl font-black whitespace-nowrap">
            Projects
            <span className="text-blue-500 dark:text-blue-500">.</span>
          </span>
          <div className="flex-grow h-0.5 ml-2 bg-sand-900"></div>
        </div>
      </div>

      <div className="relative">
        {/* First row - always visible */}
        <div className="py-5 mx-1 md:mx-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[100%] auto-rows-fr px-4">
          {firstRowProjects.map((project) => (
            <div key={project.index} className="h-full">
              <Project
                index={project.index}
                name={project.name}
                description={project.description}
                skills={project.skills}
                img_url={project.img_url}
                url={project.url}
                isOpen={isOpen}
                toggleOverlay={() => openProject(project.index)}
              />
            </div>
          ))}
        </div>

        {/* Remaining projects */}
        {hasMoreProjects && (
          <div className="relative">
            <div
              className="overflow-hidden mx-1 md:mx-4 transition-[height] duration-[400ms] ease-in-out"
              style={{ 
                height: expanded ? expandedHeight : PEEK_HEIGHT,
              }}
            >
              <div 
                ref={contentRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[100%] auto-rows-fr py-4 px-4"
              >
                {remainingProjects.map((project) => (
                  <div
                    key={project.index}
                    className={`h-full ${!expanded ? "pointer-events-none" : ""}`}
                  >
                    <Project
                      index={project.index}
                      name={project.name}
                      description={project.description}
                      skills={project.skills}
                      img_url={project.img_url}
                      url={project.url}
                      isOpen={isOpen}
                      toggleOverlay={() => openProject(project.index)}
                      forceInView={expanded ? undefined : isPeekInView}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-sand-100 from-10% via-sand-100/80 via-60% to-transparent pointer-events-none transition-opacity duration-300 ${
                expanded ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* View More / View Less button */}
            <div ref={buttonRef} className="flex justify-center relative z-10 mt-2 mb-8">
              <motion.button
                onClick={handleToggle}
                className="flex items-center gap-2 px-6 py-3 bg-sand-200 hover:bg-sand-300 border-2 border-sand-500 rounded-full font-medium transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {expanded ? (
                  <span className="flex items-center gap-2">
                    View Less <ChevronUp size={20} />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    View More <ChevronDown size={20} />
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
