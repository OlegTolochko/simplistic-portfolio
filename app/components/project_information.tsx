import { Fragment, useState, useEffect } from "react";
import { X, Github } from "lucide-react";
import { badge_urls, project_info } from "../constants/project_constants";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';

type OverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    index: number | null;
}

export function Overlay({ isOpen, onClose, index }: OverlayProps) {
    const project = project_info.find((project) => project.index === index);

    useEffect(() => {
        const body = document.body;

        if (isOpen) {
            const scrollY = window.scrollY;
            body.style.top = `-${scrollY}px`;
            body.classList.add('modal-open');
            body.dataset.scrollY = scrollY.toString();
        } else {
            const scrollY = body.dataset.scrollY;
            body.classList.remove('modal-open');
            body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0'));
        }

        return () => {
            body.classList.remove('modal-open');
            body.style.top = '';
        };
    }, [isOpen]);


    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    if (!project) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.stopPropagation();
            onClose();
        }
    };

    return isOpen ? createPortal(
        <AnimatePresence mode="wait">
                <Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleBackdropClick}
                        className="fixed inset-0 bg-black z-40 cursor-pointer"
                    />
                    
                    <div 
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-20" 
                        onClick={handleBackdropClick}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.8 }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            className="bg-sand-100 rounded-2xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto cursor-default custom-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="max-w-6xl mx-auto">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-4xl font-bold text-black mb-2">{project.name}</h2>
                                        <p className="text-xl text-gray-600">{project.description}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClose();
                                        }}
                                        className="p-2 hover:bg-sand-200 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Project Image */}
                                <div className="relative md:w-2/3 mb-8 rounded-xl overflow-hidden">
                                    <Image
                                        src={project.cropped_img_url}
                                        alt={project.name}
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto"
                                    />
                                </div>
                                {/* Skills */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-semibold mb-4">Technologies</h3>
                                    <div className="flex flex-wrap gap-3">
                                    {project.skills.map((skill, index) => {
                                        const skill_badge = badge_urls.find((badge_skill) => badge_skill.name === skill.toLowerCase())
                                        if (skill_badge && skill_badge.url) {
                                            return (
                                            <Image
                                                key={`${skill_badge.name}- ${index}`}
                                                className='rounded-lg w-auto'
                                                src={skill_badge.url}
                                                alt={skill +"_badge"}
                                                height={30}
                                                width={0}
                                                style={{ width: 'auto' }}
                                            />
                                            )
                                        }
                                        return null;
                                    })}
                                    </div>
                                </div>

                                {/* Sections */}
                                <div className="space-y-8">
                                    {project.sections.map((section, i) => (
                                        <div key={i}>
                                            <h3 className="text-2xl font-semibold mb-3">{section.title}</h3>
                                            <p className="text-gray-600 leading-relaxed text-s">
                                                {section.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <div className="flex gap-4 flex-col md:flex-row items-center">
                                        <motion.a
                                            href={project.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                                        >
                                            View Project
                                        </motion.a>
                                        <motion.a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer flex gap-2"
                                        >
                                            <Github/>
                                            View Repository
     
                                        </motion.a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Fragment>
            )
        </AnimatePresence>,
        document.body
    ) : null;
}

export default Overlay;