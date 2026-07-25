"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WaveGrid({ grid }: { grid: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = grid * grid;

  const basePositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    let idx = 0;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        pos[idx++] = (i / grid - 0.5) * 22;
        pos[idx++] = 0;
        pos[idx++] = (j / grid - 0.5) * 22;
      }
    }
    return pos;
  }, [count, grid]);

  const posRef = useRef(new Float32Array(basePositions));

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.25;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const idx = (i * grid + j) * 3;
        const x = basePositions[idx];
        const z = basePositions[idx + 2];
        posRef.current[idx + 1] =
          Math.sin(x * 0.4 + t) * Math.cos(z * 0.4 + t) * 0.6;
      }
    }
    if (ref.current) {
      (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posRef.current, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#7C3AED"
        transparent
        opacity={0.22}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function DashboardCanvas() {
  // Reduce grid on mobile to halve the particle count
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const grid = isMobile ? 20 : 28;

  // Skip canvas entirely when user prefers reduced motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) return null;

  return (
    <Canvas
      camera={{ position: [0, 9, 0], fov: 55, rotation: [Math.PI / 2, 0, 0] }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      frameloop="always"
    >
      <WaveGrid grid={grid} />
    </Canvas>
  );
}
