import { Fragment, useState } from "react";
import { X } from "lucide-react";
import { ProjectInformation, project_info } from "../constants/project_constants";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type OverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    index: number;
}

export function Overlay({ isOpen, onClose, index }: OverlayProps) {
    const project = project_info.find((project) => project.index === index);
    if (!project) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-20">
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.8 }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            className="bg-sand-100 rounded-2xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto"
                            onClick={handleModalClick}
                        >
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-4xl font-bold text-black mb-2">{project.name}</h2>
                                    <p className="text-xl text-gray-600">{project.description}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-sand-200 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Project Image */}
                            <div className="relative w-1/2 h-[300px] md:h-[400px] mb-8 rounded-xl overflow-hidden">
                                <Image
                                    src={project.img_url}
                                    alt={project.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Skills */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold mb-4">Technologies</h3>
                                <div className="flex flex-wrap gap-3">
                                    {project.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="space-y-8">
                                {project.sections.map((section, i) => (
                                    <div key={i}>
                                        <h3 className="text-2xl font-semibold mb-3">{section.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {section.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Links */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex gap-4">
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        View Project
                                    </a>
                                    <a
                                        href={project.repository_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        View Repository
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </Fragment>
            )}
        </AnimatePresence>
    );
}

export default Overlay;