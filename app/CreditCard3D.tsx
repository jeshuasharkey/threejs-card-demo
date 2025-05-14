import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MaterialControls {
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  color: string; // <- make sure this is passed from the parent
}

interface Model3DProps {
  materialProps: MaterialControls;
  statusName: string;
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Model3D({ materialProps, statusName, dragging, setDragging }: Model3DProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/spline-export.glb');
  const [targetRotationY, setTargetRotationY] = useState(Math.PI);
  const dragStart = useRef<{ x: number; rotY: number }>({ x: 0, rotY: Math.PI });

  // Animation state for entry (spring)
  const [spring, setSpring] = useState({ y: -10, vy: 0, rot: 0, vrot: 0 });
  const [entryDone, setEntryDone] = useState(false);
  const targetY = 30;
  const targetRot = Math.PI;
  const mass = 2.5;
  const stiffness = 90;
  const damping = 22;

  // Set initial rotation
  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = Math.PI;
    }
  }, []);

  // Apply materials conditionally
  useEffect(() => {
    console.log('Applying new material with color:', materialProps.color);
    
    const meshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
    });

    // Target specific mesh by index (change this index as needed)
    const targetIndex = 2; // You can change this to target different meshes
    
    meshes.forEach((child, index) => {
      if (index === targetIndex) {
        console.log('Applying color to mesh index:', index);
        const newMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(materialProps.color),
          metalness: materialProps.metalness,
          roughness: materialProps.roughness,
          clearcoat: materialProps.clearcoat,
          clearcoatRoughness: materialProps.clearcoatRoughness,
          envMapIntensity: materialProps.envMapIntensity,
        });

        child.material = newMaterial;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      } else {
        // For other meshes, keep their original material properties
        const original = child.material as THREE.MeshStandardMaterial;
        const newMaterial = new THREE.MeshPhysicalMaterial({
          color: original.color.clone(),
          metalness: materialProps.metalness,
          roughness: materialProps.roughness,
          clearcoat: materialProps.clearcoat,
          clearcoatRoughness: materialProps.clearcoatRoughness,
          envMapIntensity: materialProps.envMapIntensity,
        });

        child.material = newMaterial;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, materialProps]);

  // Rotation interaction
  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.x;
      setTargetRotationY(dragStart.current.rotY + dx * 0.01);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { x: e.clientX, rotY: targetRotationY };
  };

  useFrame((_, delta) => {
    if (!entryDone) {
      // Y spring
      let dy = spring.y - targetY;
      let ay = (-stiffness * dy - damping * spring.vy) / mass;
      let vy = spring.vy + ay * delta;
      let y = spring.y + vy * delta;

      // Rotation spring
      let drot = spring.rot - targetRot;
      let arot = (-stiffness * drot - damping * spring.vrot) / mass;
      let vrot = spring.vrot + arot * delta;
      let rot = spring.rot + vrot * delta;

      setSpring({ y, vy, rot, vrot });

      if (
        Math.abs(y - targetY) < 0.01 &&
        Math.abs(rot - targetRot) < 0.01 &&
        Math.abs(vy) < 0.01 &&
        Math.abs(vrot) < 0.01
      ) {
        setSpring({ y: targetY, vy: 0, rot: targetRot, vrot: 0 });
        setEntryDone(true);
      }
    } else {
      // After entry, allow drag rotation
      if (group.current) {
        group.current.rotation.y += (targetRotationY - group.current.rotation.y) * 0.15;
      }
    }
  });

  const sharedTextProps = {
    fontSize: 0.105,
    color: "#efefef",
    anchorX: "center" as const,
    anchorY: "middle" as const,
    rotation: [0, Math.PI, 0] as [number, number, number],
    font: "/fonts/GTAmericaMonoVF.ttf",
  };

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      position={[0, spring.y, 0]}
      rotation={[0, spring.rot, 0]}
      scale={5}
    >
      <primitive object={scene} />
      <Text position={[0, -4.72, 0.009]} {...sharedTextProps}>
        {statusName.toUpperCase()}
      </Text>
      <Text position={[0, -7.32, 0.009]} {...sharedTextProps}>
        THEO MASON
      </Text>
      <Text position={[0, -4.72, 0.051]} {...sharedTextProps} scale={[-1, 1, 1]}>
        West Village
      </Text>
      <Text position={[0, -7.32, 0.051]} {...sharedTextProps} scale={[-1, 1, 1]}>
        Member Since '22
      </Text>
    </group>
  );
}
