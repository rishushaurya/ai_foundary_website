"use client";

import { useState, useEffect } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof breakpoints;

export default function useScreenSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lessThan = (breakpoint: Breakpoint) => {
    return windowSize.width < breakpoints[breakpoint];
  };

  const greaterThan = (breakpoint: Breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  return {
    width: windowSize.width,
    height: windowSize.height,
    lessThan,
    greaterThan,
  };
}
