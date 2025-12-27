import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  MotionProps,
  useInView,
} from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { badge_urls, ProjectPreview } from "../constants/project_constants";

type BlockProps = {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  skipEntryAnimation?: boolean;
  forceInView?: boolean;
} & MotionProps;

type ProjectProps = {
  isOpen: boolean;
  toggleOverlay: () => void;
  skipEntryAnimation?: boolean;
  forceInView?: boolean;
} & ProjectPreview;

const Block: React.FC<BlockProps> = ({
  className,
  onClick,
  children,
  skipEntryAnimation = false,
  forceInView,
  ...rest
}) => {
  // If forceInView is provided (not undefined), we control animation externally
  const useExternalControl = forceInView !== undefined;
  
  return (
    <motion.div
      onClick={onClick}
      variants={{
        initial: {
          scale: skipEntryAnimation ? 1 : 0.5,
          y: skipEntryAnimation ? 0 : 50,
          opacity: skipEntryAnimation ? 1 : 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      initial="initial"
      animate={useExternalControl ? (forceInView ? "animate" : "initial") : undefined}
      whileInView={useExternalControl ? undefined : "animate"}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge("cursor-pointer", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

const Project: React.FC<ProjectProps> = ({
  index,
  name,
  description,
  skills,
  img_url,
  url,
  isOpen,
  toggleOverlay,
  skipEntryAnimation = false,
  forceInView,
}) => {
  const router = useRouter();
  const controls = useAnimationControls();
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const y = useMotionValue(0);
  const boxShadow = useMotionValue("0px 0px 0px rgba(0, 0, 0, 0)");

  const ref = React.useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px is tailwind's md breakpoint
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleHoverStart = useCallback(() => {
    controls.start({
      scale: 1.1,
      rotate: -3,
      y: -30,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
      transition: {
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      },
    });
  }, [controls]);

  const handleHoverEnd = useCallback(() => {
    controls.start({
      scale: 1,
      rotate: 0,
      y: 0,
      boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
      transition: {
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      },
    });
  }, [controls]);

  useEffect(() => {
    if (isMobile) {
      if (isInView) {
        handleHoverStart();
      } else {
        handleHoverEnd();
      }
    }
  }, [isInView, isMobile, handleHoverStart, handleHoverEnd]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      toggleOverlay();
      if (!isMobile) {
        handleHoverEnd();
      }
    }
  };

  return (
    <Block
      skipEntryAnimation={skipEntryAnimation}
      forceInView={forceInView}
      className="rounded-3xl flex flex-col border-2 p-4 border-sand-500 bg-sand-200 col-span-1 overflow-hidden w-full h-full"
      onHoverStart={() => !isMobile && handleHoverStart()}
      onHoverEnd={() => !isMobile && handleHoverEnd()}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: {
          type: "spring",
          mass: 1,
          stiffness: 200,
          damping: 20,
        },
      }}
      onClick={handleClick}
    >
      <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-bold text-black">{name}</h1>
        <p className="text-l mt-2 font-regular">{description}</p>
        <div className="flex flex-wrap gap-2 pt-4">
          {skills.map((skill, index) => {
            const skill_badge = badge_urls.find(
              (badge_skill) => badge_skill.name === skill.toLowerCase(),
            );
            if (skill_badge && skill_badge.url) {
              return (
                <Image
                  key={`${skill_badge.name}- ${index}`}
                  className="rounded-lg w-auto"
                  src={skill_badge.url}
                  alt={skill + "_badge"}
                  height={30}
                  width={0}
                  style={{ width: "auto" }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="relative w-full md:w-auto h-[230px] mt-4 md:mt-0 flex justify-end items-end">
        <motion.div
          ref={ref}
          className={`relative left-10 top-12 w-[350px] h-full rounded-tl-xl`}
          animate={controls}
          style={{ scale, rotate, y, boxShadow }}
        >
          <Image
            className="rounded-tl-xl"
            src={img_url}
            fill
            style={{ objectFit: "cover" }}
            alt={name + "_image"}
          />
        </motion.div>
      </div>
    </Block>
  );
};

export default Project;
