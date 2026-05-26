import React, { useEffect, useRef, useState } from "react";

interface Scroll3DContainerProps {
  children: React.ReactNode;
  maxRotateX?: number; // max tilt degrees on X axis
  maxRotateY?: number; // max tilt degrees on Y axis
  maxTranslateZ?: number; // max Z translate (depth pop)
  className?: string;
  intensity?: number;
}

const Scroll3DContainer: React.FC<Scroll3DContainerProps> = ({
  children,
  maxRotateX = 15,
  maxRotateY = 8,
  maxTranslateZ = 40,
  className = "",
  intensity = 1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // If element is offscreen, don't perform heavy calculations
          if (rect.bottom < 0 || rect.top > viewportHeight) {
            return;
          }

          // Calculate element's center relative to viewport center
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;

          // Normalize distance from center: -1 (at top of viewport) to +1 (at bottom of viewport)
          const rawOffset = (elementCenter - viewportCenter) / viewportCenter;
          const offset = Math.max(-1, Math.min(1, rawOffset)) * intensity;

          // X axis rotates based on top/bottom scroll offset
          const rotateX = offset * maxRotateX;
          // Y axis rotates slightly for natural dynamic twist
          const rotateY = -offset * maxRotateY;
          // Z axis pushes forward (translateZ) when closest to the center
          const translateZ = (1 - Math.abs(offset)) * maxTranslateZ;

          // Subtle shadow adjustment based on 3D depth
          const shadowIntensity = (1 - Math.abs(offset)) * 0.12 + 0.04;
          element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
          element.style.boxShadow = `0 ${20 + translateZ * 0.5}px ${40 + translateZ}px rgba(0, 0, 0, ${shadowIntensity})`;
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount to position correctly
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [maxRotateX, maxRotateY, maxTranslateZ, intensity]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-300 ease-out will-change-transform transform-gpu ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden"
      }}
    >
      {children}
    </div>
  );
};

export default Scroll3DContainer;
