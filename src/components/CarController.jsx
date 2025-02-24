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
  ({ joystickInput, onRaceEnd, onStart, disabled }, ref) => {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isBraking, setIsBraking] = useState(false); // State to track braking
    const [isReversing, setIsReversing] = useState(false); // State to track reversing

    // Audio refs for keyboard and joystick movement
    const accelerateSoundKeyboard = useRef(null);
    const reverseSoundKeyboard = useRef(null);
    const accelerateSoundJoystick = useRef(null);
    const reverseSoundJoystick = useRef(null);
    const brakeSound = useRef(null); // Brake sound instance

    useEffect(() => {
      // Initialize audio for keyboard, joystick, and brake
      accelerateSoundKeyboard.current = new Audio("/accelerate.mp3");
      reverseSoundKeyboard.current = new Audio("/reverse.mp3");
      accelerateSoundJoystick.current = new Audio("/accelerate.mp3");
      reverseSoundJoystick.current = new Audio("/reverse.mp3");
      brakeSound.current = new Audio("/brake.mp3");

      // Set lower volume for all audio instances
      accelerateSoundKeyboard.current.volume = 0.1;
      reverseSoundKeyboard.current.volume = 0.1;
      accelerateSoundJoystick.current.volume = 0.1;
      reverseSoundJoystick.current.volume = 0.1;
      brakeSound.current.volume = 0.1;

      // Preload audio files
      accelerateSoundKeyboard.current.load();
      reverseSoundKeyboard.current.load();
      accelerateSoundJoystick.current.load();
      reverseSoundJoystick.current.load();
      brakeSound.current.load();

      return () => {
        // Clean up audio objects
        if (accelerateSoundKeyboard.current) {
          accelerateSoundKeyboard.current.pause();
          accelerateSoundKeyboard.current = null;
        }
        if (reverseSoundKeyboard.current) {
          reverseSoundKeyboard.current.pause();
          reverseSoundKeyboard.current = null;
        }
        if (accelerateSoundJoystick.current) {
          accelerateSoundJoystick.current.pause();
          accelerateSoundJoystick.current = null;
        }
        if (reverseSoundJoystick.current) {
          reverseSoundJoystick.current.pause();
          reverseSoundJoystick.current = null;
        }
        if (brakeSound.current) {
          brakeSound.current.pause();
          brakeSound.current = null;
        }
      };
    }, []);

    useEffect(() => {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 640);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const WALK_SPEED = isSmallScreen ? 50 : 100;
    const RUN_SPEED = 130;
    const ROTATION_SPEED = isSmallScreen ? 0.03 : 0.02;
    const ACCELERATION = 0.5; // Acceleration rate
    const DECELERATION = 0.5; // Deceleration rate

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
    const isBrakingSoundPlaying = useRef(false); // Track if brake sound is playing

    // Function to play sound once
    const playSoundOnce = (sound) => {
      if (sound && sound.paused) {
        sound.currentTime = 0; // Reset sound to the beginning
        sound.volume = 0.1; // Lower the volume to 0.1
        sound.play().catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    };

    // Function to fade out sound
    const fadeOutSound = (sound) => {
      if (sound && !sound.paused) {
        sound.volume = 0.1; // Start fading out from a lower volume
        const fadeOutInterval = setInterval(() => {
          if (sound.volume > 0.05) {
            sound.volume -= 0.05; // Adjust the fade-out speed
          } else {
            sound.pause();
            sound.currentTime = 0;
            clearInterval(fadeOutInterval);
          }
        }, 50);
      }
    };

    useFrame(({ camera, mouse }) => {
      if (rb.current && !disabled) {
        // Only process inputs if not disabled
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
          // Play accelerate sound for keyboard forward movement
          playSoundOnce(accelerateSoundKeyboard.current);
          fadeOutSound(reverseSoundKeyboard.current);
          fadeOutSound(brakeSound.current); // Stop brake sound when moving forward
          isBrakingSoundPlaying.current = false;
        } else if (backward) {
          targetSpeed = run ? -RUN_SPEED : -WALK_SPEED;
          setIsReversing(true); // Set reversing state to true
          setIsBraking(true); // Set braking state to true when moving backward
          playSoundOnce(reverseSoundKeyboard.current);
          fadeOutSound(accelerateSoundKeyboard.current);
          fadeOutSound(brakeSound.current); // Stop brake sound when moving backward
          isBrakingSoundPlaying.current = false;
        } else {
          setIsReversing(false); // Set reversing state to false
          setIsBraking(false); // Set braking state to false
          fadeOutSound(accelerateSoundKeyboard.current);
          fadeOutSound(reverseSoundKeyboard.current);
        }

        // Joystick controls
        if (joystickInput) {
          if (joystickInput.y < 0) {
            targetSpeed = WALK_SPEED;
            onStart();
            setIsBraking(false); // Not braking when moving forward
            setIsReversing(false); // Not reversing when moving forward

            // Play accelerate sound for joystick forward movement
            playSoundOnce(accelerateSoundJoystick.current);
            fadeOutSound(reverseSoundJoystick.current);
            fadeOutSound(brakeSound.current); // Stop brake sound when moving forward
            isBrakingSoundPlaying.current = false;
          } else if (joystickInput.y > 0) {
            targetSpeed = -WALK_SPEED;
            setIsReversing(true); // Set reversing state to true
            setIsBraking(true); // Set braking state to true when moving backward

            // Play reverse sound for joystick backward movement
            playSoundOnce(reverseSoundJoystick.current);
            fadeOutSound(accelerateSoundJoystick.current);
            fadeOutSound(brakeSound.current); // Stop brake sound when moving backward
            isBrakingSoundPlaying.current = false;
          } else {
            // Fade out sounds when joystick is released
            fadeOutSound(accelerateSoundJoystick.current);
            fadeOutSound(reverseSoundJoystick.current);
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

        // Play brake sound when decelerating from forward movement to stop
        if (
          currentSpeed.current > 0 &&
          targetSpeed <= 0 &&
          !isBrakingSoundPlaying.current
        ) {
          if (brakeSound.current && brakeSound.current.paused) {
            brakeSound.current.volume = 0.1; // Lower the volume for brake sound
            playSoundOnce(brakeSound.current);
            isBrakingSoundPlaying.current = true;
          }
        }

        // Stop brake sound when the car comes to a complete stop
        if (currentSpeed.current === 0 && isBrakingSoundPlaying.current) {
          fadeOutSound(brakeSound.current);
          isBrakingSoundPlaying.current = false;
        }

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
