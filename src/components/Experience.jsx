"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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

  const handleRaceEnd = useCallback(() => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);

    let message = `Current Time: ${currentTime.toFixed(0)}s\n`;
    let playVictorySound = false;
    let playLostSound = false;

    if (bestTime === 0) {
      setBestTime(currentTime);
      message += "New Best Time!";
      playVictorySound = true;
    } else if (currentTime < bestTime) {
      setBestTime(currentTime);
      message += "New Best Time!";
      playVictorySound = true;
    } else {
      const difference = (currentTime - bestTime).toFixed(0);
      message += `You were ${difference}s slower than your best time.`;
      playLostSound = true;
    }

    setPopupMessage(message);
    setShowPopup(true);
    hasStarted.current = false;

    if (carControllerRef.current) {
      if (playVictorySound) {
        carControllerRef.current.playVictorySound();
      } else if (playLostSound) {
        carControllerRef.current.playLostSound();
      }
    }
  }, [currentTime, bestTime]);

  const handleStart = useCallback(() => {
    if (!hasStarted.current) {
      setCurrentTime(0);
      setIsTimerRunning(true);
      hasStarted.current = true;
    }
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTime(0);
    setIsTimerRunning(false);
    setShowPopup(false);
    hasStarted.current = false;
    if (carControllerRef.current) {
      carControllerRef.current.respawn();
    }
    if (blockRef.current) {
      blockRef.current.setEnabled(true);
    }
  }, []);

  const handleInfoClick = useCallback(() => {
    setShowInfoPopup(true);
  }, []);

  const handlePlayGame = useCallback(() => {
    setShowWelcomeScreen(false);
    setIsGameStarted(true);
  }, []);

  const memoizedKeyboardMap = useMemo(() => keyboardMap, []);

  return (
    <>
      <KeyboardControls map={memoizedKeyboardMap}>
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }} shadows>
          {/* <Environment preset="sunset" /> */}
          <directionalLight
            intensity={1.5}
            castShadow
            position={[-15, 20, 0]}
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-bias={-0.0005}
            shadow-camera-left={-500}
            shadow-camera-right={500}
            shadow-camera-top={500}
            shadow-camera-bottom={-500}
            shadow-camera-near={1}
            shadow-camera-far={2000}
          >
            <OrthographicCamera
              left={-500}
              right={500}
              top={500}
              bottom={-500}
              near={1}
              far={2000}
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
            {isGameStarted && (
              <CarController
                ref={carControllerRef}
                joystickInput={joystickInput}
                onRaceEnd={handleRaceEnd}
                onStart={handleStart}
                disabled={!isGameStarted}
              />
            )}
          </Physics>
        </Canvas>
      </KeyboardControls>

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
    </>
  );
};

export default Experience;
