import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "scale-up" | "3d-lift" | "3d-tilt-left" | "3d-tilt-right";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 1000,
  threshold = 0.15,
  className = ""
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced motion settings
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          // Once revealed, no need to observe anymore
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it fully rolls into the viewport
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  // Define hardware-accelerated 3D transition styles
  const getAnimationStyles = () => {
    const isMobile = window.innerWidth < 640;

    const baseTransition = {
      transitionProperty: "transform, opacity, filter",
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      willChange: "transform, opacity",
      backfaceVisibility: "hidden" as const
    };

    if (isRevealed) {
      return {
        ...baseTransition,
        opacity: 1,
        filter: "blur(0px)",
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px) scale(1)"
      };
    }

    // Unrevealed state (3D offsets)
    let initialTransform = "";
    switch (animation) {
      case "3d-lift":
        initialTransform = "perspective(1200px) rotateX(12deg) translateZ(-60px) translateY(50px) scale(0.96)";
        break;
      case "3d-tilt-left":
        initialTransform = "perspective(1200px) rotateY(-15deg) translateZ(-40px) translateX(-30px) scale(0.97)";
        break;
      case "3d-tilt-right":
        initialTransform = "perspective(1200px) rotateY(15deg) translateZ(-40px) translateX(30px) scale(0.97)";
        break;
      case "scale-up":
        initialTransform = "perspective(1200px) scale(0.92) translateZ(-30px) translateY(20px)";
        break;
      case "fade-in":
        initialTransform = "perspective(1200px) translateZ(0px)";
        break;
      case "fade-up":
      default:
        initialTransform = `perspective(1200px) translateY(${isMobile ? "25px" : "40px"}) translateZ(-20px) scale(0.98)`;
        break;
    }

    return {
      ...baseTransition,
      opacity: 0,
      filter: "blur(4px)",
      transform: initialTransform
    };
  };

  return (
    <div
      ref={ref}
      style={getAnimationStyles()}
      className={`transform-gpu ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
