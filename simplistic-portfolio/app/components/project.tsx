import React from 'react';
import Image from 'next/image';
import { motion, useAnimationControls, useMotionValue, MotionProps } from 'framer-motion';
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

interface ProjectProps {
  name: string;
  description: string;
  image: string;
  link: string;
  skills: string[];
}

type BlockProps = {
  className?: string;
  onClick?: () => void;
} & MotionProps;

const Block: React.FC<BlockProps> = ({ className, onClick, children, ...rest }) => {
  return (
    <motion.div
      onClick={onClick}
      variants={{
        initial: {
          scale: 0.5,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      initial="initial"
      whileInView="animate"
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

const Project: React.FC<ProjectProps> = ({ name, description, image, link, skills }) => {
  const router = useRouter();
  const controls = useAnimationControls();
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const y = useMotionValue(0);
  const boxShadow = useMotionValue('0px 0px 0px rgba(0, 0, 0, 0)');


  const handleHoverStart = () => {
    controls.start({
      scale: 1.1,
      rotate: -3,
      y: -30,
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)',
      transition: {
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }
    });
  };
  
  
  const handleHoverEnd = () => {
    controls.start({
      scale: 1,
      rotate: 0,
      y: 0,
      boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
      transition: {
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }
    });
  };

  const handleClick = () => {
    router.push(link);
  };

  return (
    <Block 
      className="rounded-3xl flex flex-col border-2 p-4 border-sand-500 bg-sand-200 col-span-1 overflow-hidden md:w-[50%]"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
    >
      <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-bold text-black">{name}</h1>
        <p className="text-l mt-2 font-regular">{description}</p>
        <div className="flex flex-wrap gap-3 pt-4">
          {skills.map((skill, index) => (
            <div key={index} className='rounded-3xl bg-black'>
              <h1 className="text-l py-1 px-2 font-light text-white">
                {skill}
              </h1>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative w-full md:w-auto h-[230px] mt-4 md:mt-0 flex justify-end items-end">
        <motion.div
          className="relative left-10 top-16 w-[295px] h-[250px]"
          animate={controls}
          style={{ scale, rotate, y, boxShadow }}
        >
          <Image
            src={image}
            layout="fill"
            objectFit="contain"
            alt={name}
            draggable={false}
          />
        </motion.div>
      </div>
    </Block>
  );
}

export default Project;