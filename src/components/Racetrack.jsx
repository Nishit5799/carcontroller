import React from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Racetrack(props) {
  const { nodes, materials } = useGLTF("/racetrack.glb");
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders={"trimesh"} name="ground">
        <group
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          position={[165, -40, 130]}
          scale={1.719}
        >
          <mesh
            geometry={nodes.Object_2.geometry}
            material={materials.material_0}
          />
          <mesh
            geometry={nodes.Object_3.geometry}
            material={materials.material_1}
          />
          <mesh
            geometry={nodes.Object_4.geometry}
            material={materials.material_10}
          />
          <mesh
            geometry={nodes.Object_5.geometry}
            material={materials.material_11}
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
            geometry={nodes.Object_8.geometry}
            material={materials.material_14}
          />
          <mesh
            geometry={nodes.Object_9.geometry}
            material={materials.material_15}
          />
          <mesh
            geometry={nodes.Object_10.geometry}
            material={materials.material_16}
          />
          <mesh
            geometry={nodes.Object_11.geometry}
            material={materials.material_17}
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
            geometry={nodes.Object_14.geometry}
            material={materials.material_2}
          />
          <mesh
            geometry={nodes.Object_15.geometry}
            material={materials.material_20}
          />
          <mesh
            geometry={nodes.Object_16.geometry}
            material={materials.material_21}
          />
          <mesh
            geometry={nodes.Object_17.geometry}
            material={materials.material_3}
          />
          <mesh
            geometry={nodes.Object_18.geometry}
            material={materials.material_4}
          />
          <mesh
            geometry={nodes.Object_19.geometry}
            material={materials.material_5}
          />
          <mesh
            geometry={nodes.Object_20.geometry}
            material={materials.material_6}
          />
          <mesh
            geometry={nodes.Object_21.geometry}
            material={materials.material_7}
          />
          <mesh
            geometry={nodes.Object_22.geometry}
            material={materials.material_8}
          />
          <mesh
            geometry={nodes.Object_23.geometry}
            material={materials.material_9}
          />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/racetrack.glb");
