import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Car({ isBraking, isReversing, ...props }) {
  const { nodes, materials } = useGLTF("/car.glb");

  // Change the reverse light material color based on the reversing state
  const reverseLightMaterial = isReversing
    ? new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2,
      })
    : materials.RRRX7VS__Blinker_L;
  // Change the brake light material color based on the braking state
  const brakeLightMaterial = isBraking
    ? new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2,
      })
    : materials.RRRX7VS__BrakeLight2;

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes.Object_2.geometry}
          material={materials["1RX7VS_Calipers"]}
        />
        <mesh
          geometry={nodes.Object_3.geometry}
          material={materials["1RX7VS_Rims"]}
        />
        <mesh
          geometry={nodes.Object_4.geometry}
          material={materials.RRBaseMatGlass}
        />
        <mesh
          geometry={nodes.Object_5.geometry}
          material={materials.RRBaseMatWM}
        />
        <mesh
          geometry={nodes.Object_6.geometry}
          material={materials.RRRX7VS_BrakeLight}
        />
        <mesh
          geometry={nodes.Object_7.geometry}
          material={reverseLightMaterial} // Use the conditional reverse light material
        />
        <mesh
          geometry={nodes.Object_8.geometry}
          material={reverseLightMaterial} // Use the conditional reverse light material
        />
        <mesh
          geometry={nodes.Object_9.geometry}
          material={brakeLightMaterial} // Use the conditional brake light material
        />
        <mesh
          geometry={nodes.Object_10.geometry}
          material={materials.RRRX7VS__ReverseLights}
        />
        <mesh
          geometry={nodes.Object_11.geometry}
          material={materials.RRBaseMatGeneral}
        />
        <mesh
          geometry={nodes.Object_12.geometry}
          material={materials.RRRX7VS_Body}
        />
        <mesh
          geometry={nodes.Object_13.geometry}
          material={materials.RRRX7VS_Body2}
        />
        <mesh
          geometry={nodes.Object_14.geometry}
          material={materials.RRRX7VS_HeadLights}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/car.glb");
