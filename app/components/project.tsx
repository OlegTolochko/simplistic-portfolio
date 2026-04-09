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
import SkillBadges from "./skill-badges";

type BlockProps = {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  skipEntryAnimation?: boolean;
  forceInView?: boolean;
} & MotionProps;

type ProjectProps = {
  name: string;
  description: string;
  skills: string[];
  img_url: string;
  slug: string;
  skipEntryAnimation?: boolean;
  forceInView?: boolean;
};

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
  name,
  description,
  skills,
  img_url,
  slug,
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
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px is tailwind's md breakpoint
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
    if (!isMobile) {
      handleHoverEnd();
    }
    router.push(`/projects/${slug}`);
  };

  return (
    <Block
      skipEntryAnimation={skipEntryAnimation}
      forceInView={forceInView}
      className="rounded-[2rem] flex flex-col border-2 p-3.5 md:p-4 border-sand-500 bg-gradient-to-br from-sand-160 to-sand-200 col-span-1 overflow-hidden w-full h-full"
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
        <h1 className="text-[1.9rem] leading-none md:text-[2.7rem] font-bold text-stone-950">
          {name}
        </h1>
        <p className="mt-2.5 text-[1.02rem] leading-7 text-stone-700">{description}</p>
        <SkillBadges skills={skills} badgeHeight={28} className="gap-2 pt-4" />
      </div>

      <div className="relative w-full md:w-auto h-[205px] mt-4 md:mt-0 flex justify-end items-end">
        <motion.div
          ref={ref}
          className="relative left-6 top-8 w-[305px] md:left-8 md:top-10 md:w-[320px] h-full rounded-tl-[1.35rem]"
          animate={controls}
          style={{ scale, rotate, y, boxShadow }}
        >
          <Image
            className="rounded-tl-[1.35rem]"
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
