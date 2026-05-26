import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  ox: number; // original X
  oy: number; // original Y
  oz: number; // original Z
  vx: number; // velocity X
  vy: number; // velocity Y
  vz: number; // velocity Z
}

const InteractiveMesh3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Handle scroll tracking
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Generate 3D particles in a spacious bounding box
    const particleCount = Math.min(70, Math.floor((width * height) / 20000) + 30);
    const particles: Particle[] = [];
    const size = Math.max(width, height) * 0.8;

    for (let i = 0; i < particleCount; i++) {
      // Random coordinates distributed in a 3D sphere/box
      const x = (Math.random() - 0.5) * size;
      const y = (Math.random() - 0.5) * size;
      const z = (Math.random() - 0.5) * size;
      particles.push({
        x,
        y,
        z,
        ox: x,
        oy: y,
        oz: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4
      });
    }

    let timeAngle = 0;
    const perspective = 800;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Slower dynamic auto-rotation for breathing feel
      timeAngle += prefersReducedMotion ? 0.0005 : 0.0012;

      // Scroll-based rotation inputs (X & Y axes rotation based on viewport scroll position)
      const scrollFactor = scrollYRef.current * 0.0009;
      const angleX = timeAngle + scrollFactor * 0.8;
      const angleY = timeAngle * 0.7 - scrollFactor * 0.5;
      const angleZ = scrollFactor * 0.3;

      // Trig coefficients for matrix transformation
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Projected coordinates storage
      const projected: { sx: number; sy: number; z: number; opacity: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate particles slightly in their local 3D orbits for natural biological fluidity
        if (!prefersReducedMotion) {
          p.ox += p.vx;
          p.oy += p.vy;
          p.oz += p.vz;

          // Bounce back within bounds
          if (Math.abs(p.ox) > size / 2) p.vx *= -1;
          if (Math.abs(p.oy) > size / 2) p.vy *= -1;
          if (Math.abs(p.oz) > size / 2) p.vz *= -1;
        }

        // Apply 3D Rotation Matrix
        // Rotate Y
        let x1 = p.ox * cosY - p.oz * sinY;
        let z1 = p.ox * sinY + p.oz * cosY;

        // Rotate X
        let y2 = p.oy * cosX - z1 * sinX;
        let z2 = p.oy * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Perspective Projection
        // Offset Z to place particles comfortably in front of the camera
        const depthZ = z2 + perspective + 300;

        if (depthZ > 50) {
          const scale = perspective / depthZ;
          const sx = x3 * scale + width / 2;
          const sy = y3 * scale + height / 2;

          // Fade out particles that are too close or too far
          const opacity = Math.min(1, Math.max(0, 1 - depthZ / (perspective * 2)));

          projected.push({ sx, sy, z: depthZ, opacity });

          // Draw node particle
          ctx.beginPath();
          // Scale node size based on perspective depth
          const nodeRadius = Math.max(1, 2.5 * scale);
          ctx.arc(sx, sy, nodeRadius, 0, Math.PI * 2);
          
          // Hybrid theme color: shifts between forest green and soft violet based on depth coordinate
          const colorRatio = Math.min(1, Math.max(0, (z2 + size / 2) / size));
          const r = Math.round(45 + colorRatio * 78); // 45 to 123
          const g = Math.round(106 - colorRatio * 27); // 106 to 79
          const b = Math.round(79 + colorRatio * 89); // 79 to 168
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.16})`;
          ctx.fill();
        } else {
          projected.push({ sx: -999, sy: -999, z: depthZ, opacity: 0 });
        }
      }

      // Draw connection lines in 3D perspective space
      const maxDistance = 240;
      ctx.lineWidth = 0.75;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const proj1 = projected[i];
        if (proj1.sx === -999) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const proj2 = projected[j];
          if (proj2.sx === -999) continue;

          // Calculate raw distance in 3D space
          const dx = p1.ox - p2.ox;
          const dy = p1.oy - p2.oy;
          const dz = p1.oz - p2.oz;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < maxDistance) {
            const opacity = (1 - dist3D / maxDistance) * 0.12 * Math.min(proj1.opacity, proj2.opacity);
            ctx.beginPath();
            ctx.moveTo(proj1.sx, proj1.sy);
            ctx.lineTo(proj2.sx, proj2.sy);

            // Subtle color gradient on connection line
            const grad = ctx.createLinearGradient(proj1.sx, proj1.sy, proj2.sx, proj2.sy);
            grad.addColorStop(0, `rgba(45, 106, 79, ${opacity})`); // Forest green
            grad.addColorStop(1, `rgba(123, 79, 168, ${opacity})`); // Lavender/Violet
            
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      style={{
        mixBlendMode: "multiply",
        filter: "contrast(1.05)"
      }}
    />
  );
};

export default InteractiveMesh3D;
