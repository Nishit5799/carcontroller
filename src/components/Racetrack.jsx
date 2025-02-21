import React from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Racetrack(props) {
  const { nodes, materials } = useGLTF("/racetrack.glb");
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders={"trimesh"}>
        <group
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          position={[165, -40, 170]}
          scale={1.719}
        >
         
          <mesh
            geometry={nodes.Object_4.geometry}
            material={materials.material_10}
          />

          <mesh
            geometry={nodes.Object_6.geometry}
            material={materials.material_12}
          />
          <mesh
            geometry={nodes.Object_7.geometry}
            material={materials.material_13}
          />

          <mesh
            geometry={nodes.Object_12.geometry}
            material={materials.material_18}
          />
          <mesh
            geometry={nodes.Object_13.geometry}
            material={materials.material_19}
          />

          <mesh
            geometry={nodes.Object_18.geometry}
            material={materials.material_4}
          />

          <mesh
            geometry={nodes.Object_20.geometry}
            material={materials.material_6}
          />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/racetrack.glb");
