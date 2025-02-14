import React, { useRef, useEffect } from "react";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Vector3, Quaternion } from "three";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils";
import Car from "./Car";

// Helper functions for smooth rotations
const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

const CarController = () => {
  const rb = useRef(); // Reference to the RigidBody of the car
  const container = useRef(); // Reference to the container group
  const cameraTarget = useRef(); // Reference to the camera target
  const cameraPosition = useRef(); // Reference to the camera position
  const [, get] = useKeyboardControls(); // Keyboard controls

  const speed = 10; // Base speed of the car
  const turnSpeed = 0.05; // Rotation speed of the car

  const isClicking = useRef(false);
  const movement = useRef({ x: 0, z: 0 });
  const touchPoints = useRef({});
  const targetRotation = useRef(0); // Target rotation for smooth interpolation

  useEffect(() => {
    const onMouseDown = (e) => {
      isClicking.current = true;
    };

    const onMouseUp = (e) => {
      isClicking.current = false;
      movement.current.x = 0;
      movement.current.z = 0;
    };

    const onTouchStart = (e) => {
      isClicking.current = true;
      e.preventDefault(); // Prevents long-press selection
    };

    const onTouchEnd = (e) => {
      isClicking.current = false;
      movement.current.x = 0;
      movement.current.z = 0;
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isClicking.current) {
        // Calculate movement based on mouse position relative to screen center
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        movement.current.x = (e.clientX - screenCenterX) / screenCenterX;
        movement.current.z = (e.clientY - screenCenterY) / screenCenterY;
      }
    };

    const onTouchMove = (e) => {
      Array.from(e.touches).forEach((touch) => {
        touchPoints.current[touch.identifier] = touch;
      });

      const primaryTouch =
        touchPoints.current[Object.keys(touchPoints.current)[0]];
      if (primaryTouch) {
        // Calculate movement based on touch position relative to screen center
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        movement.current.x =
          (primaryTouch.clientX - screenCenterX) / screenCenterX;
        movement.current.z =
          (primaryTouch.clientY - screenCenterY) / screenCenterY;
      }
    };

    const onTouchEnd = (e) => {
      Array.from(e.changedTouches).forEach((touch) => {
        delete touchPoints.current[touch.identifier];
      });

      if (Object.keys(touchPoints.current).length === 0) {
        movement.current.x = 0;
        movement.current.z = 0;
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(({ camera }) => {
    if (rb.current) {
      const { forward, backward, left, right } = get(); // Get keyboard input states

      const velocity = rb.current.linvel(); // Get current linear velocity
      const rotation = rb.current.rotation(); // Get current rotation

      // Calculate the direction vector based on the car's rotation
      const direction = new Vector3(0, 0, 0);

      if (forward || movement.current.z < -0.5) {
        direction.z -= 1; // Move forward along the negative Z-axis
      }
      if (backward || movement.current.z > 0.5) {
        direction.z += 1; // Move backward along the positive Z-axis
      }
      if (left || movement.current.x > 0.5) {
        direction.x -= 1; // Move left along the negative X-axis
      }
      if (right || movement.current.x < -0.5) {
        direction.x += 1; // Move right along the positive X-axis
      }

      // Normalize the direction vector to ensure consistent speed in all directions
      direction.normalize();

      // Apply the car's rotation to the direction vector
      direction.applyQuaternion(rotation);

      // Calculate the final velocity
      velocity.x = direction.x * speed;
      velocity.z = direction.z * speed;

      // Apply left/right rotation
      if (left || movement.current.x > 0.5) {
        targetRotation.current += turnSpeed; // Rotate left
      } else if (right || movement.current.x < -0.5) {
        targetRotation.current -= turnSpeed; // Rotate right
      }

      // Smoothly interpolate the car's rotation using lerpAngle
      const currentRotation = rotation.y;
      const smoothedRotation = lerpAngle(
        currentRotation,
        targetRotation.current,
        0.1
      );
      rotation.y = smoothedRotation;

      // Update the RigidBody's velocity and rotation
      rb.current.setLinvel(velocity, true);
      rb.current.setRotation(rotation, true);

      // CAMERA LOGIC
      // Get the car's position using translation()
      const carPosition = new Vector3();
      const carTranslation = rb.current.translation(); // Get the car's position as a Vector3
      carPosition.set(carTranslation.x, carTranslation.y, carTranslation.z);

      // Calculate the camera's position behind the car
      const cameraOffset = new Vector3(0, 4, 8); // Adjust these values for desired camera distance
      cameraOffset.applyQuaternion(rotation); // Apply the car's rotation to the offset
      const targetCameraPosition = carPosition.clone().add(cameraOffset);

      // Smoothly move the camera to the target position
      camera.position.lerp(targetCameraPosition, 0.1);

      // Make the camera look at the car
      camera.lookAt(carPosition);
    }
  });

  return (
    <>
      <RigidBody
        ref={rb}
        colliders="hull" // Use a hull collider for the car
        mass={1} // Set the mass of the car
        position={[0, 0.5, 0]} // Initial position of the car
        lockRotations={false} // Allow rotation
      >
        <group ref={container}>
          <group ref={cameraTarget} />
          <group ref={cameraPosition} />
          <Car colliders={false} /> {/* Render the Car component */}
        </group>
        <CapsuleCollider args={[0, 0]} />
      </RigidBody>
    </>
  );
};

export default CarController;
