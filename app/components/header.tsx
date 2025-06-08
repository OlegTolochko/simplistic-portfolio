"use client";
import { Dispatch, SetStateAction, useState, useEffect, ComponentType } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Folders, Layers3, AlignRight, X, LucideProps } from "lucide-react";
import { header_icon } from "../constants/project_constants";
import { usePortfolioContext } from "../context/ProjectContext";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isOpen } = usePortfolioContext();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const navItems = [
    // { icon: Folders, text: "Blog", section: "blog" },
    { icon: Folders, text: "Projects", section: "projects" },
    { icon: Layers3, text: "Skills", section: "skills" },
  ];

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.header
          className={`fixed top-0 left-0 right-0 z-50 py-4`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-[30px] max-w-[1440px]">
            <motion.div
              className={`border-solid border-2 rounded-xl p-4 w-full items-center flex justify-between backdrop-blur-md transition-all duration-300 ${
                scrolled
                  ? "border-sand-300/80 bg-sand-140/95 shadow-lg"
                  : "border-sand-300 bg-sand-140"
              }`}
              layout
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="relative group cursor-pointer"
                onClick={() => scrollToSection("body")}
              >
                <div className="absolute inset-0 bg-blue-300/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                <Image
                  src={header_icon}
                  width={50}
                  height={50}
                  alt="logo"
                  className="relative z-10 rounded-full"
                />
              </motion.div>

              <div className="items-center gap-2 md:flex hidden">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="relative group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.button
                      className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollToSection(item.section)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>

                      <motion.div
                        className="relative z-10 flex items-center gap-2"
                        whileHover={{ x: 2 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <item.icon
                          size={18}
                          className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200"
                        />
                        <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                          {item.text}
                        </span>
                      </motion.div>

                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div className="md:hidden">
                <motion.div
                  animate={open ? "open" : "closed"}
                  className="relative"
                >
                  <motion.button
                    onClick={() => setOpen(!open)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      variants={{
                        open: { rotate: 180 },
                        closed: { rotate: 0 },
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {open ? <X size={20} /> : <AlignRight size={20} />}
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-sand-140/95 backdrop-blur-md border-2 border-sand-300/80 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="py-2">
                          {navItems.map((item, index) => (
                            <motion.div
                              key={item.text}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Option
                                setOpen={setOpen}
                                Icon={item.icon}
                                text={item.text}
                                onClick={() => scrollToSection(item.section)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

const Option = ({
  text,
  Icon,
  setOpen,
  onClick,
}: {
  text: string;
  Icon: ComponentType<LucideProps>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClick: () => void;
}) => {
  return (
    <motion.button
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium whitespace-nowrap hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:text-blue-600 transition-all duration-200 cursor-pointer group"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Icon
          size={18}
          className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200"
        />
      </motion.div>
      <span>{text}</span>
    </motion.button>
  );
};

export default Header;
