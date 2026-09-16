import {useMemo, type ReactNode} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type V3 = [number, number, number];
export const C = {
  ink: '#334842', cream: '#fff3d8', stone: '#eed7b1', sand: '#d6b38e',
  green: '#668b70', mint: '#a8c7a9', pale: '#cad9b7', moss: '#4f7455',
  coral: '#ce775b', roof: '#be6550', gold: '#e7b552', brass: '#bd8940',
  water: '#72b8b0', waterLight: '#b9d5c8', wood: '#966d4e', bark: '#8e7252',
  sky: '#dce7dc', charcoal: '#364444', skin: '#f2caa0', blush: '#dc997b',
};

export function Mat({color, metal = 0, glow = 0}: {color: string; metal?: number; glow?: number}) {
  return <meshStandardMaterial color={color} roughness={metal ? 0.48 : 0.87} metalness={metal}
    emissive={color} emissiveIntensity={glow} />;
}

export function Box({size, position = [0,0,0], rotation = [0,0,0], color = C.cream, radius = 0.06, children}: {
  size: V3; position?: V3; rotation?: V3; color?: string; radius?: number; children?: ReactNode;
}) {
  const [w,h,d] = size;
  const geometry = useMemo(() => new RoundedBoxGeometry(w,h,d,2,Math.min(radius,w/3,h/3,d/3)), [w,h,d,radius]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
    <Mat color={color}/>{children}
  </mesh>;
}

export function Ball({position = [0,0,0], scale = [1,1,1], radius = 0.3, color = C.mint, detail = 20}: {
  position?: V3; scale?: V3; radius?: number; color?: string; detail?: number;
}) {
  return <mesh position={position} scale={scale} castShadow receiveShadow>
    <sphereGeometry args={[radius,detail,Math.round(detail * 0.7)]}/><Mat color={color}/>
  </mesh>;
}

export function Cylinder({position = [0,0,0], rotation = [0,0,0], top = 0.3, bottom, height = 1, color = C.cream, sides = 32}: {
  position?: V3; rotation?: V3; top?: number; bottom?: number; height?: number; color?: string; sides?: number;
}) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[top,bottom ?? top,height,sides]}/><Mat color={color}/>
  </mesh>;
}

export function Ring({position = [0,0,0], rotation = [0,0,0], radius = 0.5, tube = 0.06, color = C.gold}: {
  position?: V3; rotation?: V3; radius?: number; tube?: number; color?: string;
}) {
  return <mesh position={position} rotation={rotation} castShadow>
    <torusGeometry args={[radius,tube,8,48]}/><Mat color={color} metal={0.15}/>
  </mesh>;
}

export function Arch({position = [0,0,0], rotation = [0,0,0], width = 2.3, height = 3.0, depth = 0.65, thick = 0.35, color = C.cream}: {
  position?: V3; rotation?: V3; width?: number; height?: number; depth?: number; thick?: number; color?: string;
}) {
  const geometry = useMemo(() => {
    const r = width / 2;
    const s = new THREE.Shape();
    s.moveTo(-r,0); s.lineTo(-r,height-r);
    s.absarc(0,height-r,r,Math.PI,0,true);
    s.lineTo(r,0); s.lineTo(r-thick,0); s.lineTo(r-thick,height-r);
    s.absarc(0,height-r,r-thick,0,Math.PI,false);
    s.lineTo(-r+thick,0); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth,steps:1,bevelEnabled:true,bevelSize:0.045,bevelThickness:0.045,bevelSegments:2,curveSegments:24});
    g.translate(0,0,-depth/2);
    return g;
  },[width,height,depth,thick]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow><Mat color={color}/></mesh>;
}

export function Flower({position, color = C.cream, size = 1}: {position: V3; color?: string; size?: number}) {
  return <group position={position} scale={size}>
    <Cylinder position={[0,0.15,0]} top={0.018} height={0.3} color={C.moss} sides={6}/>
    {[0,1,2,3,4].map(i => <Ball key={i} position={[Math.cos(i*1.257)*0.07,0.32,Math.sin(i*1.257)*0.07]}
      scale={[1,0.5,1]} radius={0.058} color={color} detail={8}/>)}
    <Ball position={[0,0.33,0]} radius={0.036} color={C.gold} detail={8}/>
  </group>;
}

export function Tree({position = [0,0,0], scale = 1, color = C.green, round = false}: {
  position?: V3; scale?: number; color?: string; round?: boolean;
}) {
  return <group position={position} scale={scale}>
    <Cylinder position={[0,0.68,0]} height={1.35} top={0.07} bottom={0.13} color={C.bark} sides={9}/>
    <Cylinder position={[0.2,1.12,0]} rotation={[0,0,-0.7]} height={0.65} top={0.035} bottom={0.06} color={C.bark} sides={8}/>
    {round ? <>
      <Ball position={[0,1.92,0]} scale={[1.0,1.1,0.9]} radius={0.8} color={color}/>
      <Ball position={[-0.46,1.65,0.1]} scale={[1,1.05,1]} radius={0.56} color={C.mint}/>
      <Ball position={[0.46,1.73,0.1]} radius={0.53} color={color}/>
    </> : <>
      <Cylinder position={[0,1.28,0]} top={0.13} bottom={0.68} height={1.1} color={color} sides={9}/>
      <Cylinder position={[0,1.84,0]} top={0} bottom={0.54} height={1.25} color={C.mint} sides={9}/>
    </>}
    <Ball position={[0,0.04,0]} scale={[1,0.15,1]} radius={0.46} color={C.pale}/>
  </group>;
}

