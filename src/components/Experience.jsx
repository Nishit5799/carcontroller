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
import gsap from "gsap";

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
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const timerRef = useRef(null);
  const carControllerRef = useRef();
  const blockRef = useRef();
  const hasStarted = useRef(false);
  const welcomeTextRef = useRef();

  useEffect(() => {
    if (showWelcomeScreen) {
      const letters = Array.from(welcomeTextRef.current.children);
      gsap.fromTo(
        letters,
        { y: -10 },
        {
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "ease.in",
          repeat: -1,
          repeatDelay: 0.5,
          yoyo: true,
        }
      );
    }
  }, [showWelcomeScreen]);

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
    // Stop the timer
    setIsTimerRunning(false);
    clearInterval(timerRef.current); // Ensure the interval is cleared

    // Calculate the final time and display the message
    let message = `Current Time: ${currentTime.toFixed(0)}s\n`;
    let playVictorySound = false;
    let playLostSound = false;

    if (bestTime === 0) {
      // First time completing the race
      setBestTime(currentTime);
      message += "New Best Time!";
      playVictorySound = true; // Play victory sound for the first time
    } else if (currentTime < bestTime) {
      // New best time
      setBestTime(currentTime);
      message += "New Best Time!";
      playVictorySound = true; // Play victory sound
    } else {
      // Did not beat the best time
      const difference = (currentTime - bestTime).toFixed(0);
      message += `You were ${difference}s slower than your best time.`;
      playLostSound = true; // Play lost sound
    }

    setPopupMessage(message);
    setShowPopup(true);
    hasStarted.current = false;

    // Play the appropriate sound
    if (carControllerRef.current) {
      if (playVictorySound) {
        carControllerRef.current.playVictorySound();
      } else if (playLostSound) {
        carControllerRef.current.playLostSound();
      }
    }
  };

  const handleStart = () => {
    if (!hasStarted.current) {
      setCurrentTime(0); // Reset the timer to 0
      setIsTimerRunning(true);
      hasStarted.current = true;
    }
  };

  const handleReset = () => {
    setCurrentTime(0); // Reset the timer to 0
    setIsTimerRunning(false);
    setShowPopup(false);
    hasStarted.current = false;
    if (carControllerRef.current) {
      carControllerRef.current.respawn();
    }
    if (blockRef.current) {
      blockRef.current.setEnabled(true);
    }
  };

  const handleInfoClick = () => {
    setShowInfoPopup(true);
  };

  const handlePlayGame = () => {
    setShowWelcomeScreen(false);
    setIsGameStarted(true);
  };

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
          <RigidBody
            type="fixed"
            colliders={false}
            name="block"
            position={[-0.5, -2, 7]}
            ref={blockRef}
          >
            <CuboidCollider args={[15, 5, 0.1]} />
          </RigidBody>
          <CarController
            ref={carControllerRef}
            joystickInput={joystickInput}
            onRaceEnd={handleRaceEnd}
            onStart={handleStart}
            disabled={!isGameStarted}
          />
        </Physics>
      </Canvas>
      {showWelcomeScreen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 start">
          <div className="text-center">
            <div
              ref={welcomeTextRef}
              className="font-choco tracking-wider text-5xl font-bold text-yellow-400 mb-8 flex"
            >
              {"Welcome to Nishkart".split("").map((letter, index) => (
                <span key={index} className="inline-block">
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </div>
            <button
              onClick={handlePlayGame}
              className="px-8 py-2 font-choco tracking-widest bg-orange-500 text-white sm:text-2xl text-3xl font-bold rounded-lg hover:bg-orange-600 transition-colors"
            >
              PLAY GAME
            </button>
            <div
              onClick={handleInfoClick}
              className="mt-4 py-2 font-choco text-white sm:text-2xl text-3xl tracking-widest cursor-pointer bg-blue-500 hover:bg-blue-600 sm:w-[50%] w-[57%] h-[30%] mx-auto rounded-lg transition-colors"
            >
              HOW TO PLAY?
            </div>
          </div>
        </div>
      )}

      <Joystick
        onMove={setJoystickInput}
        onStart={handleStart}
        disabled={!isGameStarted}
      />
      <Timer
        bestTime={bestTime}
        currentTime={currentTime}
        onReset={handleReset}
        showPopup={showPopup}
        popupMessage={popupMessage}
        showInfoPopup={showInfoPopup}
        setShowInfoPopup={setShowInfoPopup}
        onInfoClick={handleInfoClick}
      />
    </KeyboardControls>
  );
};

export default Experience;
