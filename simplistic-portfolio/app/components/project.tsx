import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProjectProps {
  name: string;
  description: string;
  image: string;
  link: string;
  skills: string[];
}

function ProjectImage(image: string) {
    const background = `url(${image})`;
  
    return (
      <motion.div
        className="card-container"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.8 }}
      >
        <div className="splash" style={{ background }} />
        <motion.div className="card">
        </motion.div>
      </motion.div>
    );
  }

const Project: React.FC<ProjectProps> = ({ name, description, image, link, skills }) => {
  return (
    <div className="rounded-3xl flex border-4 border-sand-500 bg-sand-300">
      <div className="flex-1 p-5 items-top">
        <h1 className="text-3xl font-semibold mt-4 text-gray-500">{name}</h1>
        <p className="text-2xl mt-2 font-bold">{description}</p>
        <div className="flex gap-x-3 pt-10 items-left align-bottom">
        {skills.map((skill, index) => (
            <div className='rounded-xl bg-black'>
            <h1 key={index} className="text-3xl py-2 px-4 font-light text-white text-xl">
                {skill}
            </h1>
            </div>
        ))}
        </div>
      </div>
      
      <motion.div 
        className="w-1/3"
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Image src={image} width={150} height={150} alt="logo" className="rounded-3xl border-4 border-sand-300" />
      </motion.div>
    </div>
  );
}

export default Project;
