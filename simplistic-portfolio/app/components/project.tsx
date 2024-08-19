import React from 'react';
import Image from 'next/image';
import { MotionProps, AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";


interface ProjectProps {
  name: string;
  description: string;
  image: string;
  link: string;
  skills: string[];
}


type BlockProps = {
  className?: string;
} & MotionProps;

const Block = ({ className, ...rest }: BlockProps) => {
  return (
    <motion.div
      variants={{
        initial: {
          scale: 0.5,
          rotate: 10,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          rotate: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "",
        className
      )}
      {...rest}
    />
  );
};

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
    <AnimatePresence>
    <Block 
        className="rounded-3xl flex border-4 border-sand-500 bg-sand-300"
        initial="initial"
        animate="animate"
        exit="initial"
      >
      <div className="flex-1 p-5 items-top">
        <h1 className="text-5xl font-semibold mt-4 text-gray-500">{name}</h1>
        <p className="text-2xl mt-2 font-bold">{description}</p>
        <div className="flex gap-x-3 pt-10 items-left align-bottom">
        {skills.map((skill, index) => (
            <div className='rounded-3xl bg-black'>
            <h1 key={index} className="text-xl py-2 px-4 font-light text-white">
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
        <Image src={image} width={150} height={150} alt="logo" className="rounded-xl border-4 border-sand-300" />
      </motion.div>
    </Block>
    </AnimatePresence>
  );
}

export default Project;
