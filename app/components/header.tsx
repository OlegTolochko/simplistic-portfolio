"use client";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Folders, Layers3, AlignRight } from "lucide-react";
import { header_icon } from "../constants/project_constants";


const Header = () => {
    const [open, setOpen] = useState(false);
    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        setOpen(false);
    };
    return (
        <header className="py-6">
            <div className="container">
                <div className="border-solid border-2 border-sand-300 rounded-xl p-5 bg-sand-140 py-2 w-full items-center flex justify-between">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
                        <Image src={header_icon} width={50} height={50} alt="logo" />
                    </motion.div>
                    <div className="items-center gap-8 md:flex hidden">
                        <motion.div
                            className="text-l font-regular flex items-center gap-1 cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => scrollToSection('projects')}
                        >
                            <Folders size={20} /> Projects
                        </motion.div>
                        <motion.div
                            className="text-l font-regular flex items-center gap-1 cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            onClick={() => scrollToSection('skills')}
                        >
                            <Layers3 size={20} /> Skills
                        </motion.div>
                    </div>
                    <motion.div
                        className="text-l font-regular md:hidden items-center gap-2"
                        whileHover={{ scale: 1.1 }}
                    >
                        <motion.div animate={open ? "open" : "closed"} className="relative">
                        <button
                        onClick={() => setOpen((pv) => !pv)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-blue-500 hover:bg-blue-500 transition-colors"
                        >
                        <AlignRight size={25} />
                        </button>
                        <motion.ul
                        initial={wrapperVariants.closed}
                        variants={wrapperVariants}
                        style={{ originY: "top", translateX: "-80%" }}
                        className="flex flex-col gap-2 p-2 rounded-lg border-2 border-sand-300 bg-sand-140 shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
                        >
                                <Option setOpen={setOpen} Icon={Folders} text="Projects" onClick={() => scrollToSection('projects')} />
                                <Option setOpen={setOpen} Icon={Layers3} text="Skills" onClick={() => scrollToSection('skills')} />
                        </motion.ul>
                        
                        </motion.div>
                        
                    </motion.div>
                </div>
            </div>
        </header>
    );
};


const Option = ({
    text,
    Icon,
    setOpen,
    onClick,
  }: {
    text: string;
    Icon: React.FC;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onClick: () => void;
  }) => {
    return (
      <motion.li
        variants={itemVariants}
        onClick={() => {
            setOpen(false);
            onClick();
        }}
        className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-blue-100 text-slate-700 hover:text-blue-500 transition-colors cursor-pointer"
      >
        <motion.span variants={actionIconVariants}>
          <Icon />
        </motion.span>
        <span>{text}</span>
      </motion.li>
    );
  };
  
  const wrapperVariants = {
    open: {
      scaleY: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    closed: {
      scaleY: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.1,
      },
    },
  };
  
  const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
  };
  
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
      },
    },
    closed: {
      opacity: 0,
      y: -15,
      transition: {
        when: "afterChildren",
      },
    },
  };
  
  const actionIconVariants = {
    open: { scale: 1, y: 0 },
    closed: { scale: 0, y: -7 },
  };
  
  

export default Header;