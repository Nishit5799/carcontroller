import React, { useEffect, useRef, useState } from "react";
import Car from "./Car";
import { RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils";

const CarController = ({ joystickInput }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const WALK_SPEED = 50;
  const RUN_SPEED = 70;
  const ROTATION_SPEED = isSmallScreen ? 0.02 : 0.02;
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

  useFrame(({ camera, mouse }) => {
    if (rb.current) {
      const vel = rb.current.linvel();
      const movement = {
        x: 0,
        z: 0,
      };

      let targetSpeed = 0;

      // Keyboard controls
      if (get().forward) {
        targetSpeed = get().run ? RUN_SPEED : WALK_SPEED;
      } else if (get().backward) {
        targetSpeed = get().run ? -RUN_SPEED : -WALK_SPEED;
      }

      // Joystick controls
      if (joystickInput) {
        if (joystickInput.y < 0) {
          targetSpeed = WALK_SPEED;
        } else if (joystickInput.y > 0) {
          targetSpeed = -WALK_SPEED;
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

      // Keyboard rotation
      if (get().left) {
        movement.x = 1;
      }
      if (get().right) {
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
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);
      camera.lookAt(cameraLookAt.current);
    }
  });

  const respawn = () => {
    rb.current.setTranslation({ x: 0, y: 5, z: 0 });
    rotationTarget.current = 0; // Reset the rotation target
    container.current.rotation.y = 0; // Reset the container's rotation
  };

  return (
    <RigidBody
      colliders={"hull"}
      lockRotations
      ref={rb}
      gravityScale={10}
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject.name === "space") {
          respawn();
        }
      }}
    >
      <group ref={container}>
        <group ref={cameraTarget} position-z={-5.5} rotation-y={Math.PI} />
        <group ref={cameraPosition} position-y={10} position-z={18} />
        <group ref={character} rotation-y={Math.PI}>
          <Car scale={isSmallScreen ? 2.18 : 3.18} position-y={-0.25} />
        </group>
      </group>
    </RigidBody>
  );
};

export default CarController;
