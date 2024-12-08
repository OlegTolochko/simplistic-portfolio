"use client";
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { skills_images, utilized_libraries, linked_in_username, github_username, github_source } from "@/app/constants/project_constants";
import { Copy, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { Linkedin, Github, MapPin } from "lucide-react";
import Link from "next/link";



const SocialButtons = () => {
  const github_link = "https://github.com/" + github_username
  const linked_in_link = "https://www.linkedin.com/in/" + linked_in_username
  return (
      <div className="flex gap-3 pt-3">
          <motion.a
              href={linked_in_link}
              target="_blank"
              rel="noopener noreferrer"
              className="box"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Linkedin className="mr-2" size={25}/>
          </motion.a>
          <motion.a
              href={github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="box"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
                  <Github className="mr-2" size={25}/>
          </motion.a>
      </div>
  );
};


const UsedLibraries = () => {
  const libraries = utilized_libraries
  
  return (
    <div className="flex gap-2">
      {libraries.map((lib) => {
        const skill = skills_images.find((skill) => skill.title === lib.name);
        if (skill && skill.url) {
          return (
            <motion.a
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl p-2"
              style={{backgroundColor: skill.bgColor}}
              key={lib.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Image
                src={skill.url}
                alt={lib.name}
                width={30}
                height={30}
              />
            </motion.a>
          );
        }
        return null;
      })}
    </div>  
  );
};


const Bottom = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [message, setMessage] = useState<string>("Text copied to clipboard!");
  const TIME = 2000;

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      setCopySuccess(true);
      setMessage("Email Copied!");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setMessage("Failed!");
    }
  };

  useEffect(() => {
    if (copySuccess) {
      setTimeout(() => {
        setCopySuccess(false);
      }, TIME);
    }
  }, [copySuccess]);

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.8 }
  };

  return (
    <>
    <div className="mt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-y-6 gap-x-4 relative">
      <div className="flex-row">
        <div className="font-bold text-3xl">
          Feel free to reach out:
        </div>
        <motion.div 
          className="flex text-blue-500 pt-3 text-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => copyText("oleg.i.tolochko@gmail.com")
          }

        >
          <Copy color="#60a5fa" size={25} />
          <div className="pl-1">
            oleg.i.tolochko@gmail.com
          </div>
        </motion.div>
        <SocialButtons/>
      </div>
      <div className="text-lg items-center">
        <div className="flex items-center gap-2 bg-slate-800 py-2 px-3 rounded-2xl text-sand-100">
        <motion.div
          className="w-4 h-4 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            backgroundColor: ["#ccffcc", "#a5faa5", "#ccffcc"],
          }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span>Available for work</span>
      </div>
      <div className="flex pt-2 gap-2">
      <MapPin size={25} className="text-slate-800"/>
      Munich, Germany  
      </div>
        
      </div>
      <div className="">
        <h2 className="text-lg font-regular mb-4">This Website was built with:</h2>
        <UsedLibraries />
      </div>
      
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-md bg-sand-200 text-black text-lg shadow-lg"
          >
            <p>{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <div className="text-lg flex flex-col justify-between items-center pb-8 mt-auto">
      <div className="flex items-center space-x-4">
        <a
          href={github_source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Github size={24} />
        </a>
        <Link href="/impressum" className="text-gray-600 hover:text-gray-800 transition-colors">
          Impressum
        </Link>
      </div>
    </div>
    </>
  );
};



export default Bottom;