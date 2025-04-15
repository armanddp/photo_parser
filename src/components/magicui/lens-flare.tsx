"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Position {
  x: number;
  y: number;
}

interface LensFlareProps {
  position?: Position;
  defaultPosition?: Position;
  isStatic?: boolean;
  duration?: number;
  flareSize?: number;
  opacity?: number;
  className?: string;
}

const LensFlare: React.FC<LensFlareProps> = ({
  position,
  defaultPosition = { x: -100, y: -100 },
  isStatic = false,
  duration = 0.1,
  flareSize = 600,
  opacity = 0.2,
  className = "",
}) => {
  const flareRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] =
    useState<Position>(defaultPosition);

  useEffect(() => {
    const updateFlarePosition = (x: number, y: number) => {
      if (flareRef.current) {
        flareRef.current.style.setProperty("--x", `${x}px`);
        flareRef.current.style.setProperty("--y", `${y}px`);
      }
    };

    if (position) {
      setCurrentPosition(position);
      updateFlarePosition(position.x, position.y);
    } else if (!isStatic) {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setCurrentPosition({ x, y });
        updateFlarePosition(x, y);
      };

      const parentElement = flareRef.current?.parentElement;
      if (parentElement) {
        parentElement.addEventListener("mousemove", handleMouseMove);
        return () => {
          parentElement.removeEventListener("mousemove", handleMouseMove);
        };
      }
    }
  }, [position, isStatic]);

  return (
    <motion.div
      ref={flareRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={
        {
          "--x": `${currentPosition.x}px`,
          "--y": `${currentPosition.y}px`,
          "--flare-size": `${flareSize}px`,
          "--flare-opacity": `${opacity}`,
          "--duration": `${duration}s`,
          maskImage: "radial-gradient(circle at center, white, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle at center, white, transparent 100%)",
        } as React.CSSProperties
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration }}
    >
      <motion.div
        className="absolute inset-[-100%]" // Ensure the background covers the entire area
        style={{
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "-50%",
          background: `radial-gradient(
            var(--flare-size) circle at var(--x) var(--y),
            rgba(255, 255, 255, var(--flare-opacity)) 0%,
            rgba(255, 255, 255, 0) 100%
          )`,
          transition: `transform var(--duration) ease-out`,
          transformOrigin: "center center",
        }}
        // Optional: Add animation for the background movement if needed
        // animate={{ x: 0, y: 0 }} // Example animation
        // transition={{ type: "spring", stiffness: 50, damping: 10 }}
      />
    </motion.div>
  );
};

export { LensFlare }; 