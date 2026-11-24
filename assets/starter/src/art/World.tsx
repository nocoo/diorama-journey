import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Arch, Ball, Box, Cylinder, Flower, Ring, Tree, C } from "./primitives";
import { HEIGHT, WIDTH, SPACING, sceneAt, side, smooth } from "../motion.mjs";
import story from "../story.json";
import timing from "../generated/timing.json";

function Camera({ frame }: { frame: number }) {
  const { camera } = useThree();
  const state = sceneAt(frame, timing);
  const arc = Math.sin(state.travel * Math.PI);
  useLayoutEffect(() => {
    const orthographic = camera as THREE.OrthographicCamera;
    orthographic.position.set(6.8 + arc, 7.8 + arc, 12);
    orthographic.lookAt(0, 1, 0);
    orthographic.zoom = 90 - 14 * arc - 4 * (1 - smooth(frame / 90));
    // Keep the full render canvas; moving a smaller canvas clips travelling geometry.
    orthographic.setViewOffset(
      WIDTH,
      HEIGHT,
      WIDTH / 2 - (state.stageLeft + 615),
      12,
      WIDTH,
      HEIGHT,
    );
    orthographic.updateProjectionMatrix();
  }, [camera, arc, frame, state.stageLeft]);
  return null;
}

function Platform({ index }: { index: number }) {
  return (
    <group>
      <Cylinder
        position={[0, -0.83, 0]}
        top={4.4}
        bottom={3.72}
        height={1.45}
        sides={8}
        color={index % 2 ? "#cebaa4" : "#d9c7b2"}
      />
      <Cylinder position={[0, -0.08, 0]} top={4.5} height={0.2} sides={48} color={C.cream} />
      <Cylinder
        position={[0, 0.03, 0]}
        top={4.3}
        height={0.06}
        sides={48}
        color={index % 2 ? "#c9d5bf" : "#dbe0c9"}
      />
      <Box position={[0, 0.14, 1.82]} size={[8.4, 0.2, 1.3]} color={C.stone} />
      {Array.from({ length: 17 }, (_, step) => step).map((step) => (
        <Box
          key={step}
          position={[-4 + step * 0.5, 0.26, 1.82]}
          size={[0.43, 0.025, 1.12]}
          color={step % 3 ? "#f0e2cc" : "#f8ecda"}
          radius={0.02}
        />
      ))}
      <Tree position={[-3.1, 0.07, -1.55]} scale={0.84} color={C.moss} />
      <Tree position={[3.1, 0.07, -1.2]} scale={0.75} color={C.green} round />
      {[-2.8, -2.4, 2.5, 2.9].map((x, i) => (
        <Flower key={x} position={[x, 0.08, 2.65]} color={i % 2 ? C.coral : C.cream} size={0.9} />
      ))}
      <Ball position={[-3.65, 0.15, 0.3]} scale={[1, 0.5, 0.8]} radius={0.3} color={C.stone} />
      <mesh position={[3.6, -1.8, -0.3]} rotation={[0.3, 0.5, 0.4]} castShadow>
        <dodecahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial color={C.stone} />
      </mesh>
    </group>
  );
}

function Crossing({ x }: { x: number }) {
  return (
    <group position={[x, 0.13, 1.82]}>
      <Box size={[7.8, 0.24, 1.25]} color={C.cream} />
      {[-1, 1].map((sign) => (
        <group key={sign}>
          {[-3, -1.5, 0, 1.5, 3].map((p) => (
            <Cylinder
              key={p}
              position={[p, 0.36, sign * 0.54]}
              top={0.03}
              height={0.6}
              sides={8}
              color={C.brass}
            />
          ))}
          <Box position={[0, 0.68, sign * 0.54]} size={[7.8, 0.05, 0.05]} color={C.gold} />
        </group>
      ))}
      {[-2.6, 0, 2.6].map((p) => (
        <Arch
          key={p}
          position={[p, -1.75, 0]}
          width={2.6}
          height={1.65}
          depth={0.5}
          thick={0.2}
          color={C.stone}
        />
      ))}
    </group>
  );
}

function Landmark({ kind, local }: { kind: string; local: number }) {
  const reveal = smooth(local / 100);
  if (kind === "gate")
    return (
      <group position={[0, 0, -0.7]}>
        <Box position={[0, 0.17, 0]} size={[3.5, 0.32, 2.3]} color={C.stone} />
        <Arch
          position={[0, 0.33, 0]}
          width={2.5}
          height={3.7}
          depth={0.9}
          thick={0.5}
          color={C.cream}
        />
        <Box position={[0, 4.1, 0]} size={[2.9, 0.22, 1.2]} color={C.coral} />
        <Ring position={[0, 2.45, 0.52]} radius={0.66} tube={0.045} color={C.gold} />
        <Ball position={[0, 2.45, 0.52]} radius={0.19} color={C.gold} />
        <Cylinder position={[-1.8, 0.6, 0.5]} height={1.2} top={0.22} color={C.mint} />
        <Cylinder position={[1.8, 0.9, 0.5]} height={1.8} top={0.22} color={C.mint} />
      </group>
    );
  if (kind === "stairs")
    return (
      <group position={[-0.2, 0, -0.6]}>
        {Array.from({ length: 7 }, (_, step) => step).map((step) => {
          const height = (0.35 + step * 0.38) * smooth((local - step * 8) / 55);
          return (
            <Box
              key={step}
              position={[-1.8 + step * 0.53, height / 2, 0.35]}
              size={[0.56, Math.max(0.02, height), 1.65]}
              color={step % 2 ? C.cream : C.stone}
            />
          );
        })}
        <Box position={[1.75, 1.6, -0.25]} size={[1.15, 3.2, 1.8]} color={"#aac5ba"} />
        <Arch position={[1.75, 3.2, -0.25]} width={1.2} height={1.8} depth={0.7} thick={0.2} />
        <Box position={[1.75, 5.05, -0.25]} size={[1.65, 0.18, 1.2]} color={C.coral} />
        <Ring position={[1.75, 4.15, 0.15]} radius={0.25} tube={0.04} color={C.gold} />
      </group>
    );
  if (kind === "workshop")
    return (
      <group position={[0, 0, -0.65]}>
        <Cylinder position={[0, 0.22, 0]} top={2.2} height={0.4} sides={8} color={C.stone} />
        {[-1, 0, 1].map((x, i) => (
          <Box
            key={x}
            position={[x * 1.05, 0.85 + i * 0.5 + (1 - smooth((local - i * 16) / 90)) * 1.3, 0]}
            size={[0.85, 1 + i * 0.35, 0.9]}
            color={[C.mint, C.cream, C.coral][i]}
          />
        ))}
        <group position={[0, 3.15, 0]} rotation={[0, local / 140, 0]}>
          <Ring radius={1.38} tube={0.1} color={C.gold} />
          <Ring rotation={[0, Math.PI / 2, 0]} radius={1.05} tube={0.05} color={C.brass} />
          <Ball radius={0.28} color={C.cream} />
        </group>
      </group>
    );
  if (kind === "bridge")
    return (
      <group position={[0, 0, -0.8]}>
        {[-1, 1].map((sign) => (
          <group key={sign} position={[sign * 1.8, 0, 0]}>
            <Box
              position={[0, 1.45, 0]}
              size={[1.3, 2.9, 1.8]}
              color={sign < 0 ? C.cream : "#b0c6b3"}
            />
            <Arch
              position={[0, 2.9, 0]}
              width={1.35}
              height={1.6}
              depth={0.8}
              thick={0.25}
              color={C.cream}
            />
            <Box position={[0, 4.6, 0]} size={[1.75, 0.18, 1.2]} color={C.coral} />
          </group>
        ))}
        <group scale={[Math.max(0.01, reveal), 1, 1]}>
          <Box position={[0, 2.95, 0]} size={[3.6, 0.28, 1.05]} color={C.stone} />
          <Box position={[0, 3.45, 0.47]} size={[3.6, 0.06, 0.06]} color={C.gold} />
          <Arch
            position={[0, 0.35, 0]}
            width={2.3}
            height={2.45}
            depth={0.6}
            thick={0.28}
            color={C.cream}
          />
        </group>
      </group>
    );
  return (
    <group position={[0, 0, -0.6]}>
      <Cylinder position={[0, 0.2, 0]} top={2.35} height={0.32} color={C.stone} />
      <Cylinder position={[0, 0.41, 0]} top={1.9} height={0.12} color={"#9fb8a0"} />
      <Cylinder position={[0, 1.22, 0]} top={0.4} bottom={0.65} height={1.55} color={C.cream} />
      <Ring
        position={[0, 2.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        radius={0.6}
        tube={0.1}
        color={C.gold}
      />
      <Ball position={[0, 2.55, 0]} radius={0.46} color={C.gold} />
      <Ring position={[0, 2.55, 0]} radius={0.94} tube={0.035} color={C.brass} />
      {Array.from({ length: 9 }, (_, slot) => slot).map((slot) => (
        <group key={slot} scale={Math.max(0.05, smooth((local - slot * 9) / 80))}>
          <Flower
            position={[Math.cos(slot * 2.4) * 1.6, 0.5, Math.sin(slot * 2.4) * 1.3]}
            color={slot % 2 ? C.coral : C.cream}
            size={1.8}
          />
        </group>
      ))}
    </group>
  );
}

function Lantern({ x, frame }: { x: number; frame: number }) {
  return (
    <group position={[x, 0.75 + Math.sin(frame / 21) * 0.065, 1.82]} rotation={[0, frame / 115, 0]}>
      <Cylinder position={[0, -0.27, 0]} top={0.26} height={0.11} color={C.brass} />
      <mesh castShadow>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial
          color={"#f1c465"}
          emissive={"#eeb84c"}
          emissiveIntensity={0.24}
          roughness={0.58}
        />
      </mesh>
      <Cylinder position={[0, 0.27, 0]} top={0.22} bottom={0.28} height={0.12} color={C.gold} />
      <Ring position={[0, 0.44, 0]} radius={0.13} tube={0.03} color={C.brass} />
      <Ring position={[0, 0, 0]} radius={0.34} tube={0.025} color={C.brass} />
      <Ring
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        radius={0.34}
        tube={0.025}
        color={C.brass}
      />
    </group>
  );
}

export function World({ frame }: { frame: number }) {
  const state = sceneAt(frame, timing);
  return (
    <ThreeCanvas
      width={WIDTH}
      height={HEIGHT}
      orthographic
      shadows
      dpr={1}
      camera={{ position: [6.8, 7.8, 12], zoom: 90, near: 0.1, far: 75 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: WIDTH,
        height: HEIGHT,
        background: "transparent",
        maskImage: `linear-gradient(to ${side(state.index) > 0 ? "right" : "left"}, rgba(0,0,0,${1 - state.textOpacity}) 44%, #000 54%)`,
      }}
    >
      <Camera frame={frame} />
      <hemisphereLight args={["#fff5e4", "#a9bfb0", 2]} />
      <directionalLight
        position={[-4, 9, 7]}
        color={"#fff0d5"}
        intensity={3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-normalBias={0.035}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[6, 4, -4]} color={"#dde8e0"} intensity={0.8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[65, 40]} />
        <shadowMaterial transparent opacity={0.07} />
      </mesh>
      <group position={[-state.journey * SPACING, 0, 0]}>
        {story.scenes.map(
          (scene, index) =>
            Math.abs(index - state.journey) < 1.1 && (
              <group key={scene.id} position={[index * SPACING, 0, 0]}>
                <Platform index={index} />
                <Landmark kind={scene.landmark} local={frame - timing.scenes[index].start} />
              </group>
            ),
        )}
        {story.scenes
          .slice(1)
          .map(
            (scene, index) =>
              Math.abs(index + 0.5 - state.journey) < 1.1 && (
                <Crossing key={scene.id} x={(index + 0.5) * SPACING} />
              ),
          )}
        <Lantern x={state.x} frame={frame} />
      </group>
    </ThreeCanvas>
  );
}
