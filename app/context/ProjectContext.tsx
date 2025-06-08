"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";

interface PortfolioContextProps {
  isOpen: boolean;
  selectedProjectIndex: number | null;
  openProject: (index: number) => void;
  closeOverlay: () => void;
}

const PortfolioContext = createContext<PortfolioContextProps | undefined>(
  undefined,
);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<
    number | null
  >(null);

  const openProject = (index: number) => {
    setSelectedProjectIndex(index);
    setIsOpen(true);
  };

  const closeOverlay = () => {
    setIsOpen(false);
  };

  const value = {
    isOpen,
    selectedProjectIndex,
    openProject,
    closeOverlay,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider",
    );
  }
  return context;
}