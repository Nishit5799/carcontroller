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

    const accelerateSound = useRef(null);
    const reverseSound = useRef(null);
    const brakeSound = useRef(null);

    // Initialize the audio objects in useEffect
    useEffect(() => {
      accelerateSound.current = new Audio("/accelerate.wav"); // Path to your accelerate sound
      reverseSound.current = new Audio("/reverse.wav"); // Path to your reverse sound
      brakeSound.current = new Audio("/brake.wav"); // Path to your brake sound

      // Optionally, set loop for sounds that need to loop
      accelerateSound.current.loop = true; // Loop the accelerate sound
      reverseSound.current.loop = true; // Loop the reverse sound

      // Debugging: Log when sounds are loaded
      accelerateSound.current.onloadeddata = () =>
        console.log("Accelerate sound loaded");
      reverseSound.current.onloadeddata = () =>
        console.log("Reverse sound loaded");
      brakeSound.current.onloadeddata = () => console.log("Brake sound loaded");

      // Cleanup sounds on unmount
      return () => {
        accelerateSound.current.pause();
        reverseSound.current.pause();
        brakeSound.current.pause();
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

    // Function to play a sound from the beginning
    const playSoundFromStart = (sound) => {
      if (sound) {
        sound.currentTime = 0; // Reset sound to the beginning
        sound
          .play()
          .catch((error) => console.error("Failed to play sound:", error));
      }
    };

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

          // Play accelerate sound from the beginning
          if (accelerateSound.current.paused) {
            playSoundFromStart(accelerateSound.current);
          }
          // Stop reverse sound if playing
          if (!reverseSound.current.paused) {
            reverseSound.current.pause();
          }
        } else if (backward) {
          targetSpeed = run ? -RUN_SPEED : -WALK_SPEED;
          setIsReversing(true); // Set reversing state to true
          setIsBraking(true); // Set braking state to true when moving backward

          // Play reverse sound from the beginning
          if (reverseSound.current.paused) {
            playSoundFromStart(reverseSound.current);
          }
          // Stop accelerate sound if playing
          if (!accelerateSound.current.paused) {
            accelerateSound.current.pause();
          }
        } else {
          setIsReversing(false); // Set reversing state to false
          setIsBraking(false); // Set braking state to false

          // If the car is still moving forward, keep playing the accelerate sound
          if (currentSpeed.current > 0) {
            if (accelerateSound.current.paused) {
              playSoundFromStart(accelerateSound.current);
            }
          }
          // If the car is still moving backward, keep playing the reverse sound
          else if (currentSpeed.current < 0) {
            if (reverseSound.current.paused) {
              playSoundFromStart(reverseSound.current);
            }
          }
          // If the car has come to rest, stop both sounds
          else {
            if (!accelerateSound.current.paused) {
              accelerateSound.current.pause();
            }
            if (!reverseSound.current.paused) {
              reverseSound.current.pause();
            }
          }
        }

        // Joystick controls
        if (joystickInput) {
          if (joystickInput.y < 0) {
            targetSpeed = WALK_SPEED;
            onStart(); // Call onStart immediately when moving forward
            setIsBraking(false); // Not braking when moving forward
            setIsReversing(false); // Not reversing when moving forward

            // Play accelerate sound from the beginning
            if (accelerateSound.current.paused) {
              playSoundFromStart(accelerateSound.current);
            }
            // Stop reverse sound if playing
            if (!reverseSound.current.paused) {
              reverseSound.current.pause();
            }
          } else if (joystickInput.y > 0) {
            targetSpeed = -WALK_SPEED;
            setIsReversing(true); // Set reversing state to true
            setIsBraking(true); // Set braking state to true when moving backward

            // Play reverse sound from the beginning
            if (reverseSound.current.paused) {
              playSoundFromStart(reverseSound.current);
            }
            // Stop accelerate sound if playing
            if (!accelerateSound.current.paused) {
              accelerateSound.current.pause();
            }
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
      rb.current.setTranslation({ x: 0, y: -10, z: -30 });
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }); // Reset linear velocity to zero
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }); // Reset angular velocity to zero
      rotationTarget.current = 0; // Reset the rotation target
      container.current.rotation.y = 0; // Reset the container's rotation

      // Stop all sounds
      if (accelerateSound.current) {
        accelerateSound.current.pause();
      }
      if (reverseSound.current) {
        reverseSound.current.pause();
      }
      if (brakeSound.current) {
        brakeSound.current.pause();
      }

      // Reset states
      setIsBraking(false);
      setIsReversing(false);
      currentSpeed.current = 0; // Reset the current speed
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
