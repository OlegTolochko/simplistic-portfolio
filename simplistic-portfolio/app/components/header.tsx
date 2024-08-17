"use client";
import React from "react";
import { useEffect, useState } from "react";

const Header = () => {
    return (
        <header className="header">
            <div className="header__content">
                <div className="flex-wrap border-slate-300 rounded-lg box-borders p-4 box-border border-4">
                    <h1>
                       Simplistic Portfolio 
                    </h1>
                </div>
                <h1 className="header__title">Simplistic Portfolio</h1>
                <p className="header__subtitle">A simple portfolio template</p>
            </div>
        </header>
    );
};

export default Header;