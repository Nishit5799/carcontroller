"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  KeyboardControls,
  OrthographicCamera,
} from "@react-three/drei";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";

import Racetrack from "./Racetrack";
import CarController from "./CarController";
import Joystick from "./Joystick";
import Background from "./Background";
import Timer from "./Timer";

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
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [bestTime, setBestTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 0.1);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const handleRaceEnd = () => {
    setIsTimerRunning(false);
    let message = `Current Time: ${currentTime.toFixed(2)}s\n`;
    if (currentTime < bestTime || bestTime === 0) {
      setBestTime(currentTime);
      message += "New Best Time!";
    } else {
      const difference = (currentTime - bestTime).toFixed(2);
      message += `You were ${difference}s slower than your best time.`;
    }
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleStart = () => {
    if (!isTimerRunning) {
      setCurrentTime(0);
      setIsTimerRunning(true);
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsTimerRunning(false);
    setShowPopup(false);
    // Reset the car position and velocity
    if (carControllerRef.current) {
      carControllerRef.current.respawn();
    }
  };

  const carControllerRef = useRef();

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }} shadows>
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
        <Background />
        <Physics>
          <Racetrack />
          <RigidBody
            type="fixed"
            colliders={false}
            sensor
            name="space"
            position-y={-21}
          >
            <CuboidCollider args={[500, 0.5, 500]} />
          </RigidBody>
          <RigidBody
            type="fixed"
            colliders={false}
            sensor
            name="raceEnd"
            position={[-0.5, -2, 11]}
          >
            <CuboidCollider args={[15, 5, 0.1]} />
          </RigidBody>
          <CarController
            ref={carControllerRef}
            joystickInput={joystickInput}
            onRaceEnd={handleRaceEnd}
            onStart={handleStart}
          />
        </Physics>
      </Canvas>
      <Joystick onMove={setJoystickInput} onStart={handleStart} />
      <Timer
        bestTime={bestTime}
        currentTime={currentTime}
        onReset={handleReset}
        showPopup={showPopup}
        popupMessage={popupMessage}
      />
    </KeyboardControls>
  );
};

export default Experience;
