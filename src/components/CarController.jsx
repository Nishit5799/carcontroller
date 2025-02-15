import React, { useEffect, useRef, useState } from "react";
import Car from "./Car";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

import { useKeyboardControls } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils";

const CarController = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const WALK_SPEED = 20;
  const RUN_SPEED = 30;
  const ROTATION_SPEED = isSmallScreen ? 0.02 : 0.1;
  //   const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls("Car Control", {
  //     WALK_SPEED: { value: 0.8, min: 0.1, max: 10, step: 0.1 },
  //     RUN_SPEED: { value: 1.6, min: 0.2, max: 30, step: 0.1 },
  //     ROTATION_SPEED: {
  //       value: degToRad(0.5),
  //       min: degToRad(0.1),
  //       max: degToRad(5),
  //       step: degToRad(0.1),
  //     },
  //   });

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
  const isClicking = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);

  useEffect(() => {
    const onMouseDown = (e) => {
      isClicking.current = true;
    };
    const onMouseUp = (e) => {
      isClicking.current = false;
    };

    const onTouchStart = (e) => {
      isTouching.current = true;
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchMove = (e) => {
      if (isTouching.current) {
        touchEnd.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchEnd = (e) => {
      isTouching.current = false;
      touchStart.current = { x: 0, y: 0 };
      touchEnd.current = { x: 0, y: 0 };
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(({ camera, mouse }) => {
    if (rb.current) {
      const vel = rb.current.linvel();
      const movement = {
        x: 0,
        z: 0,
      };

      if (get().forward) {
        movement.z = -1;
      }
      if (get().backward) {
        movement.z = 1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (isClicking.current) {
        movement.x = -mouse.x;
        movement.z = -mouse.y;
      }

      if (isTouching.current) {
        const deltaX = touchEnd.current.x - touchStart.current.x;
        const deltaY = touchEnd.current.y - touchStart.current.y;

        // Swipe up/down for forward/backward movement
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          movement.z = deltaY > 0 ? 1 : -1; // Swipe up for forward, swipe down for backward
        }

        // Swipe left/right for rotation
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          rotationTarget.current += ROTATION_SPEED * (deltaX > 0 ? -1 : 1); // Swipe right for right turn, swipe left for left turn
        }
      }

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
        vel.x = Math.sin(rotationTarget.current) * speed * movement.z;
        vel.z = Math.cos(rotationTarget.current) * speed * movement.z;
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

  return (
    <RigidBody colliders={false} lockRotations ref={rb}>
      <group ref={container}>
        <group ref={cameraTarget} position-z={-5.5} rotation-y={Math.PI} />
        <group ref={cameraPosition} position-y={10} position-z={18} />
        <group ref={character} rotation-y={Math.PI}>
          <Car scale={2.18} position-y={-0.25} />
        </group>
      </group>
      <CapsuleCollider args={[0.08, 0.15]} />
    </RigidBody>
  );
};

export default CarController;
