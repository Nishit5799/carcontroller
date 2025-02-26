import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Car from "./Car";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils";

const CarController = forwardRef(
  ({ joystickInput, onRaceEnd, onStart }, ref) => {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isBraking, setIsBraking] = useState(false); // State to track braking
    const [isReversing, setIsReversing] = useState(false); // State to track reversing
    const [isMovingForward, setIsMovingForward] = useState(false); // State to track forward movement

    const audioContextRef = useRef(null); // Ref for the Web Audio API context
    const audioBufferRef = useRef(null); // Ref for the audio buffer
    const audioSourceRef = useRef(null); // Ref for the audio source
    const fadeOutIntervalRef = useRef(null); // Ref for the fade-out interval

    useEffect(() => {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 640);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Initialize the Web Audio API
    useEffect(() => {
      // Create the AudioContext
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Load the sound file
      const loadSound = async () => {
        try {
          const response = await fetch("/accelerate.mp3"); // Replace with your sound file path
          const arrayBuffer = await response.arrayBuffer();
          audioBufferRef.current =
            await audioContextRef.current.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.error("Error loading sound file:", error);
        }
      };

      loadSound();

      // Cleanup the AudioContext when the component unmounts
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }, []);

    // Function to fade out the sound
    const fadeOutSound = () => {
      if (!audioSourceRef.current) return;

      const fadeOutTime = 600; // Fade out time in milliseconds
      const initialVolume = 1;
      const step = initialVolume / (fadeOutTime / 10); // Reduce volume in steps

      let currentVolume = initialVolume;

      fadeOutIntervalRef.current = setInterval(() => {
        if (audioSourceRef.current && currentVolume > 0) {
          currentVolume -= step;
          audioSourceRef.current.volume = currentVolume;
        } else {
          clearInterval(fadeOutIntervalRef.current);
          if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
          }
        }
      }, 10); // Adjust volume every 20ms
    };

    // Play or stop the sound based on the car's movement
    useEffect(() => {
      if (isMovingForward) {
        if (audioBufferRef.current && audioContextRef.current) {
          // Stop any existing sound and fade out
          if (audioSourceRef.current) {
            clearInterval(fadeOutIntervalRef.current); // Stop the fade-out process
            audioSourceRef.current.stop(); // Stop the current sound
            audioSourceRef.current = null; // Reset the audio source
          }

          // Create a new audio source and start playing
          audioSourceRef.current = audioContextRef.current.createBufferSource();
          audioSourceRef.current.buffer = audioBufferRef.current;
          audioSourceRef.current.loop = true; // Loop the sound
          audioSourceRef.current.volume = 1; // Reset volume to full
          audioSourceRef.current.connect(audioContextRef.current.destination);
          audioSourceRef.current.start(0);
        }
      } else {
        // Fade out the sound if the car is not moving forward
        if (audioSourceRef.current) {
          fadeOutSound();
        }
      }
    }, [isMovingForward]);

    const WALK_SPEED = isSmallScreen ? 50 : 100;
    const RUN_SPEED = 130;
    const ROTATION_SPEED = isSmallScreen ? 0.03 : 0.02;
    const ACCELERATION = 0.5; // Acceleration rate
    const DECELERATION = 1; // Deceleration rate

    const rb = useRef();
    const container = useRef();
    const character = useRef();
    const rotationTarget = useRef(0);
    const cameraTarget = useRef();
    const cameraPosition = useRef();
    const cameraworldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());
    const [, get] = useKeyboardControls();

    const currentSpeed = useRef(0); // Current speed of the car

    useFrame(({ camera, mouse }) => {
      if (rb.current) {
        const vel = rb.current.linvel();
        const movement = {
          x: 0,
          z: 0,
        };

        let targetSpeed = 0;

        // Keyboard controls
        const { forward, backward, left, right, run } = get();
        if (forward) {
          targetSpeed = run ? RUN_SPEED : WALK_SPEED;
          onStart();
          setIsBraking(false); // Not braking when moving forward
          setIsReversing(false); // Not reversing when moving forward
          setIsMovingForward(true); // Set moving forward state to true
        } else if (backward) {
          if (currentSpeed.current > 0) {
            targetSpeed = 0; // Stop the car if it's moving forward
          } else {
            targetSpeed = 0; // Prevent backward movement
          }
          setIsReversing(true); // Set reversing state to true
          setIsMovingForward(false); // Set moving forward state to false
        } else {
          setIsReversing(false); // Set reversing state to false
          setIsBraking(false); // Set braking state to false
          setIsMovingForward(false); // Set moving forward state to false
        }

        // Joystick controls
        if (joystickInput) {
          if (joystickInput.y < 0) {
            targetSpeed = WALK_SPEED;
            onStart();
            setIsBraking(false); // Not braking when moving forward
            setIsReversing(false); // Not reversing when moving forward
            setIsMovingForward(true); // Set moving forward state to true
          } else if (joystickInput.y > 0) {
            if (currentSpeed.current > 0) {
              targetSpeed = 0; // Stop the car if it's moving forward
            } else {
              targetSpeed = 0; // Prevent backward movement
            }
            setIsReversing(true); // Set reversing state to true
            setIsMovingForward(false); // Set moving forward state to false
          }
          rotationTarget.current += ROTATION_SPEED * joystickInput.x;
        }

        // Gradually adjust the current speed towards the target speed
        if (currentSpeed.current < targetSpeed) {
          currentSpeed.current += ACCELERATION;
        } else if (currentSpeed.current > targetSpeed) {
          currentSpeed.current -= DECELERATION;
        }

        // Apply the current speed to the movement
        if (currentSpeed.current !== 0) {
          movement.z = currentSpeed.current > 0 ? -1 : 1;
        }

        // Set braking state only when moving backward
        setIsBraking(currentSpeed.current < 0);

        // Keyboard rotation
        if (left) {
          movement.x = 1;
        }
        if (right) {
          movement.x = -1;
        }

        if (movement.x !== 0) {
          rotationTarget.current += ROTATION_SPEED * movement.x;
        }

        if (movement.x !== 0 || movement.z !== 0) {
          vel.x =
            Math.sin(rotationTarget.current) *
            Math.abs(currentSpeed.current) *
            movement.z;
          vel.z =
            Math.cos(rotationTarget.current) *
            Math.abs(currentSpeed.current) *
            movement.z;
        }

        rb.current.setLinvel(vel, true);
      }

      // CAMERA
      container.current.rotation.y = MathUtils.lerp(
        container.current.rotation.y,
        rotationTarget.current,
        0.1
      );
      cameraPosition.current.getWorldPosition(cameraworldPosition.current);
      camera.position.lerp(cameraworldPosition.current, 0.1);
      if (cameraTarget.current) {
        cameraTarget.current.getWorldPosition(
          cameraLookAtWorldPosition.current
        );
        cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);
        camera.lookAt(cameraLookAt.current);
      }
    });

    const respawn = () => {
      rb.current.setTranslation({ x: 0, y: -10, z: -10 });
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }); // Reset linear velocity
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }); // Reset angular velocity
      rotationTarget.current = 0; // Reset the rotation target
      container.current.rotation.y = 0; // Reset the container's rotation
    };

    // Expose the respawn function to the parent component
    useImperativeHandle(ref, () => ({
      respawn,
    }));

    return (
      <RigidBody
        colliders={false}
        lockRotations
        ref={rb}
        gravityScale={9}
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject.name === "raceEnd") {
            onRaceEnd();
          } else if (other.rigidBodyObject.name === "space") {
            respawn();
          }
        }}
      >
        <group ref={container}>
          <group ref={cameraTarget} position-z={-5.5} rotation-y={Math.PI} />
          <group ref={cameraPosition} position-y={10} position-z={18} />
          <group ref={character} rotation-y={Math.PI}>
            <Car
              scale={isSmallScreen ? 2.7 : 3.18}
              position-y={-0.25}
              isBraking={isBraking}
              isReversing={isReversing} // Pass the isReversing state to the Car component
            />
            <CapsuleCollider args={[0.5, 3.5]} position={[0, 3, 0]} />
          </group>
        </group>
      </RigidBody>
    );
  }
);

export default CarController;
