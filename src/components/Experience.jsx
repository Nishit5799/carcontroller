"use client";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  KeyboardControls,
  //   OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";

import { Physics } from "@react-three/rapier";
import Racetrack from "./Racetrack";
import CarController from "./CarController";

const keyboardMap = [
  {
    name: "forward",
    keys: ["ArrowUp", "KeyW"],
  },
  {
    name: "backward",
    keys: ["ArrowDown", "KeyS"],
  },
  {
    name: "left",
    keys: ["ArrowLeft", "KeyA"],
  },
  {
    name: "right",
    keys: ["ArrowRight", "KeyD"],
  },
  {
    name: "run",
    keys: ["Shift"],
  },
];

const Experience = () => {
  const shadowCameraRef = useRef();
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }} shadows>
        {/* <OrbitControls /> */}
        <Environment preset="sunset" />
        <directionalLight
          intensity={0.65}
          castShadow
          position={[-15, 10, 15]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.00005}
        >
          <OrthographicCamera
            left={-22}
            right={15}
            top={10}
            bottom={-20}
            ref={shadowCameraRef}
            attach={"shadow-camera"}
          />
        </directionalLight>
        <Physics>
          <Racetrack />
          <CarController />
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
};

export default Experience;
