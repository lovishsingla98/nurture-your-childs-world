import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Scroll state shared across all shapes ── */
const scrollState = { progress: 0 };

function useScrollSync() {
  React.useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollState.progress = window.scrollY / max;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

/* ── Each shape moves & rotates independently based on its own seed ── */
interface ShapeConfig {
  pos: [number, number, number];
  geo: "torus" | "icosahedron" | "octahedron" | "sphere" | "dodecahedron";
  color: string;
  scale: number;
  opacity: number;
  distort?: boolean;
  // Per-shape scroll behavior seeds
  seed: number;
}

function IndependentShape({ pos, geo, color, scale, opacity, distort, seed }: ShapeConfig) {
  const ref = useRef<THREE.Mesh>(null!);

  // Pre-compute unique per-shape scroll coefficients from seed
  const coeff = useMemo(() => {
    const s = seed;
    return {
      // Idle rotation speeds — different per axis, per shape
      idleX: 0.1 + (Math.sin(s * 1.1) * 0.5 + 0.5) * 0.3,
      idleY: 0.1 + (Math.cos(s * 2.3) * 0.5 + 0.5) * 0.4,
      idleZ: 0.05 + (Math.sin(s * 3.7) * 0.5 + 0.5) * 0.15,
      // Scroll-driven rotation — unique axis emphasis and direction
      scrollRotX: (Math.sin(s * 4.1) - 0.2) * Math.PI * 1.5,
      scrollRotY: (Math.cos(s * 5.3) - 0.1) * Math.PI * 2,
      scrollRotZ: Math.sin(s * 6.7) * Math.PI * 0.8,
      // Scroll-driven position drift
      scrollDriftX: Math.sin(s * 7.9) * 2,
      scrollDriftY: Math.cos(s * 8.3) * 2.5,
      scrollDriftZ: Math.sin(s * 9.1) * 1.5,
    };
  }, [seed]);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    const p = scrollState.progress;

    // Idle spin — unique per shape
    ref.current.rotation.x += delta * coeff.idleX;
    ref.current.rotation.y += delta * coeff.idleY;
    ref.current.rotation.z += delta * coeff.idleZ;

    // Scroll-driven rotation overlay
    ref.current.rotation.x += p * coeff.scrollRotX * delta * 2;
    ref.current.rotation.y += p * coeff.scrollRotY * delta * 2;

    // Scroll-driven position drift — each shape drifts differently
    ref.current.position.x = pos[0] + p * coeff.scrollDriftX;
    ref.current.position.y = pos[1] + p * coeff.scrollDriftY;
    ref.current.position.z = pos[2] + p * coeff.scrollDriftZ;
  });

  const geometry = useMemo(() => {
    switch (geo) {
      case "torus": return <torusGeometry args={[1, 0.4, 32, 48]} />;
      case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
      case "octahedron": return <octahedronGeometry args={[1, 0]} />;
      case "sphere": return <sphereGeometry args={[1, 32, 32]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
    }
  }, [geo]);

  // Float speed/intensity also unique per shape
  const floatSpeed = 1 + Math.sin(seed * 2.1) * 0.8;
  const floatIntensity = 0.5 + Math.cos(seed * 3.3) * 0.4;

  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={floatIntensity}>
      <mesh ref={ref} position={pos} scale={scale}>
        {geometry}
        {distort ? (
          <MeshDistortMaterial
            color={color}
            roughness={0.5}
            metalness={0.1}
            distort={0.2}
            speed={1.5}
            transparent
            opacity={opacity}
          />
        ) : (
          <meshPhysicalMaterial
            color={color}
            roughness={0.35}
            metalness={0.05}
            transparent
            opacity={opacity}
            clearcoat={0.3}
            clearcoatRoughness={0.4}
          />
        )}
      </mesh>
    </Float>
  );
}

/* ── Scene — no group rotation, each shape is fully independent ── */
function Scene() {
  const shapes: ShapeConfig[] = useMemo(() => [
    // Scattered widely: X from -8 to +8, Y from -5 to +5, Z from -2 to -10
    { pos: [6.5, 3.5, -3],    geo: "sphere",       color: "#2D6A4F", scale: 0.5,  opacity: 0.5,  distort: true,  seed: 1.0 },
    { pos: [-7, 2, -4],       geo: "icosahedron",   color: "#7B4FA8", scale: 0.45, opacity: 0.45, seed: 2.3 },
    { pos: [3, -4, -3],       geo: "dodecahedron",  color: "#355C7D", scale: 0.4,  opacity: 0.45, seed: 3.7 },
    { pos: [-5, -3, -5],      geo: "octahedron",    color: "#C06C84", scale: 0.35, opacity: 0.4,  seed: 4.9 },
    { pos: [8, -1.5, -6],     geo: "torus",         color: "#2D6A4F", scale: 0.45, opacity: 0.35, seed: 5.2 },
    { pos: [-3, 4.5, -4],     geo: "sphere",        color: "#7B4FA8", scale: 0.55, opacity: 0.4,  distort: true, seed: 6.8 },
    { pos: [0, -5, -5],       geo: "dodecahedron",  color: "#355C7D", scale: 0.3,  opacity: 0.4,  seed: 7.1 },
    { pos: [-8, -1, -3],      geo: "icosahedron",   color: "#2D6A4F", scale: 0.4,  opacity: 0.45, seed: 8.4 },
    { pos: [5, 5, -7],        geo: "octahedron",    color: "#C06C84", scale: 0.35, opacity: 0.3,  seed: 9.6 },
    { pos: [-2, 0, -8],       geo: "sphere",        color: "#7B4FA8", scale: 0.7,  opacity: 0.25, distort: true, seed: 10.2 },
    { pos: [1, 3, -3],        geo: "dodecahedron",  color: "#2D6A4F", scale: 0.3,  opacity: 0.4,  seed: 11.5 },
    { pos: [-6, -5, -4],      geo: "torus",         color: "#355C7D", scale: 0.35, opacity: 0.35, seed: 12.8 },
  ], []);

  return (
    <>
      {shapes.map((s, i) => (
        <IndependentShape key={i} {...s} />
      ))}
    </>
  );
}

/* ── Main component ── */
const FloatingScene3D: React.FC = () => {
  useScrollSync();

  const [reducedMotion] = React.useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
          <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#EAF0E6" />
          <fog attach="fog" args={["#FAFBF9", 12, 30]} />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FloatingScene3D;
