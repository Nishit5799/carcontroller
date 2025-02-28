import React, { useEffect } from "react";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

export default function Car({ isBraking, isReversing, ...props }) {
  const { nodes, materials } = useGLTF("/car.glb");

  // Convert all materials to MeshStandardMaterial or MeshPhysicalMaterial for realistic reflections
  useEffect(() => {
    Object.values(materials).forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) {
        // Convert non-standard materials to MeshStandardMaterial
        const newMaterial = new THREE.MeshStandardMaterial({
          color: material.color,
          map: material.map,
          metalness: 0.9, // High metalness for reflective surfaces
          roughness: 0.2, // Low roughness for smooth, shiny surfaces
          envMapIntensity: 5, // Reduced reflection intensity for lower brightness
        });
        material.dispose(); // Dispose of the old material to free up memory
        Object.assign(material, newMaterial); // Replace the old material with the new one
      } else {
        // Enhance existing MeshStandardMaterial
        material.metalness = 0.9;
        material.roughness = 0.2;
        material.envMapIntensity = 0.2; // Reduced reflection intensity for lower brightness
      }
    });
  }, [materials]);

  // Change the brake light material color based on the braking state
  const reverseLightMaterial = isBraking
    ? new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2,
      })
    : materials.RRRX7VS__BrakeLight2;

  // Change the reverse light material color based on the reversing state
  const brakeLightMaterial = isReversing
    ? new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2,
      })
    : materials.RRRX7VS__Blinker_L;

  return (
    <>
      <Environment
        files="/reflect.hdr" // Replace with the path to your HDR file
        background={true} // Optional: Set the environment as the background
        intensity={0.5}
      />
      <group {...props} dispose={null}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Object_2.geometry}
            material={materials["1RX7VS_Calipers"]}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_3.geometry}
            material={materials["1RX7VS_Rims"]}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_4.geometry}
            material={materials.RRBaseMatGlass}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_5.geometry}
            material={materials.RRBaseMatWM}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_6.geometry}
            material={materials.RRRX7VS_BrakeLight}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_7.geometry}
            material={reverseLightMaterial} // Use the conditional reverse light material
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_8.geometry}
            material={reverseLightMaterial} // Use the conditional reverse light material
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_9.geometry}
            material={brakeLightMaterial} // Use the conditional brake light material
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_10.geometry}
            material={materials.RRRX7VS__ReverseLights}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_11.geometry}
            material={materials.RRBaseMatGeneral}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_12.geometry}
            material={materials.RRRX7VS_Body}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_13.geometry}
            material={materials.RRRX7VS_Body2}
            castShadow // Enable shadow casting
          />
          <mesh
            geometry={nodes.Object_14.geometry}
            material={materials.RRRX7VS_HeadLights}
            castShadow // Enable shadow casting
          />
        </group>
      </group>
    </>
  );
}

useGLTF.preload("/car.glb");
