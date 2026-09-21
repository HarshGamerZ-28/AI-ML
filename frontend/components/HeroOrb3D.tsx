"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = ["#f8bcdc", "#c9b6ff", "#aeead9", "#ffdcae"];
const STRAND_COUNT = 22;
const RADIUS = 1.6;

/** One great-circle around the sphere, rotated about the Y axis so every strand still
 * shares the same two poles — this is what makes them all converge at a point on each
 * side, like the reference video, instead of just looking like a tangled ball. */
function Strand({ rotationY, color, opacity, width }: { rotationY: number; color: string; opacity: number; width: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = 0;
      const y = RADIUS * Math.sin(t);
      const z = RADIUS * Math.cos(t);
      const v = new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
      pts.push([v.x, v.y, v.z]);
    }
    return pts;
  }, [rotationY]);

  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={width} />;
}

function OrbitDot({ speed, tilt, radius, color }: { speed: number; tilt: number; radius: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.set(
      radius * Math.cos(t),
      radius * Math.sin(t) * Math.sin(tilt),
      radius * Math.sin(t) * Math.cos(tilt)
    );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function CenterGlobe() {
  const ref = useRef<THREE.Group>(null!);
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    if (!reduced) ref.current.rotation.y += delta * 0.55; // spins faster/independently of the outer strands
  });

  return (
    <group ref={ref}>
      {/* bright core */}
      <mesh>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {/* globe grid — this is what actually reads as "spinning" since its facets move */}
      <mesh>
        <sphereGeometry args={[0.46, 20, 14]} />
        <meshBasicMaterial color="#c9b6ff" wireframe transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 5]}>
        <sphereGeometry args={[0.52, 14, 10]} />
        <meshBasicMaterial color="#f8bcdc" wireframe transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}

function WovenSphere() {
  const group = useRef<THREE.Group>(null!);
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    if (!reduced) group.current.rotation.y += delta * 0.12;
  });

  const strands = useMemo(
    () =>
      Array.from({ length: STRAND_COUNT }, (_, i) => ({
        rotationY: (i / STRAND_COUNT) * Math.PI,
        color: PALETTE[i % PALETTE.length],
        opacity: 0.32 + (i % 3) * 0.1,
        width: 1.1,
      })),
    []
  );

  return (
    <group ref={group}>
      {/* ambient halo — stays soft/static, the globe inside is what spins */}
      <mesh>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshBasicMaterial color="#c9b6ff" transparent opacity={0.18} toneMapped={false} />
      </mesh>

      <CenterGlobe />

      {strands.map((s, i) => <Strand key={i} {...s} />)}

      <OrbitDot speed={0.5} tilt={0.5} radius={2.1} color="#ffffff" />
      <OrbitDot speed={0.35} tilt={-0.8} radius={2.35} color="#aeead9" />
    </group>
  );
}

export default function HeroOrb3D() {
  return (
    <div className="relative aspect-square w-full max-w-[440px] mx-auto">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.75]}
      >
        <Suspense fallback={null}>
          <WovenSphere />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.6}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}