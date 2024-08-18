"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const Header = () => {
    return (
        <header className="py-6">
            <div className="container">
                <div className="border-solid border-2 border-sand-300 rounded-xl p-5 bg-sand-140 py-2 w-full items-center flex justify-between">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
                        <Image src={"/t-black.ico"} width={75} height={75} alt="logo" />
                    </motion.div>
                    <h1 className="text-2xl font-bold">
                       Simplistic Portfolio 
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;