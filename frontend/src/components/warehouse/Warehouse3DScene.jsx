import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Category color mappings for 3D boxes
const CATEGORY_COLORS_3D = {
  'Cooking Essentials': '#10b981', // emerald
  'Dairy & Beverages': '#06b6d4', // cyan
  'Grains & Staples': '#f59e0b', // amber
  'Health & Sweets': '#a855f7', // purple
  'Snacks': '#f43f5e', // rose
  'General Goods': '#3b82f6', // blue
};

// Animated Autonomous Guided Vehicle (AGV / Forklift)
function MovingAGV({ isNight }) {
  const agvRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.8;
    // Moves back and forth along main central corridor (z: -12 to 12)
    const zPos = Math.sin(t) * 11;
    if (agvRef.current) {
      agvRef.current.position.z = zPos;
      // Rotate 180 degrees depending on travel direction
      const dir = Math.cos(t) >= 0 ? 0 : Math.PI;
      agvRef.current.rotation.y = THREE.MathUtils.lerp(agvRef.current.rotation.y, dir, 0.1);
    }
  });

  return (
    <group ref={agvRef} position={[0, 0.3, 0]}>
      {/* AGV Chassis */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.6, 0.45, 2.4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cab/Mast */}
      <mesh position={[0, 0.9, -0.6]} castShadow>
        <boxGeometry args={[1.2, 0.9, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Safety Flashing Beacon */}
      <mesh position={[0, 1.45, -0.6]}>
        <cylinderGeometry args={[0.15, 0.15, 0.25, 12]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#f43f5e"
          emissiveIntensity={isNight ? 2.5 : 1.2}
        />
      </mesh>
      {/* Wheels */}
      {[-0.85, 0.85].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* Headlights */}
      <spotLight
        position={[0, 0.4, 1.3]}
        target-position={[0, 0, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={isNight ? 4 : 1.5}
        color="#e0f2fe"
      />
    </group>
  );
}

// Single Storage Rack Tier with Shelves and Product Boxes
function RackUnit({
  position,
  aisleName,
  bayIndex,
  products = [],
  selectedProduct,
  onSelectProduct,
  isNight
}) {
  const rackWidth = 4.2;
  const rackHeight = 4.5;
  const rackDepth = 1.4;

  return (
    <group position={position}>
      {/* Rack Uprights (Vertical steel blue columns) */}
      {[-rackWidth / 2, rackWidth / 2].map((x, xi) =>
        [-rackDepth / 2, rackDepth / 2].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, rackHeight / 2, z]} castShadow>
            <boxGeometry args={[0.12, rackHeight, 0.12]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.25} />
          </mesh>
        ))
      )}

      {/* 3 Horizontal Shelf Beams (Orange/Yellow industrial steel) */}
      {[0.2, 1.7, 3.2].map((y, level) => (
        <group key={level} position={[0, y, 0]}>
          {/* Front & Back Beams */}
          {[-rackDepth / 2, rackDepth / 2].map((z, bi) => (
            <mesh key={bi} position={[0, 0.05, z]} castShadow>
              <boxGeometry args={[rackWidth, 0.1, 0.08]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          {/* Shelf Deck (Mesh wire or pallet support) */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[rackWidth - 0.2, 0.04, rackDepth - 0.1]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
          </mesh>

          {/* 2 Cargo Pallets on each shelf level */}
          {[-1.1, 1.1].map((palletX, pi) => {
            const slotIndex = level * 2 + pi;
            const product = products[slotIndex % products.length];
            const isSelected = selectedProduct && product && selectedProduct.productId === product.productId;
            const isLowStock = product && product.quantity <= (product.lowStockThreshold || 10);
            const boxColor = product
              ? (CATEGORY_COLORS_3D[product.category] || '#3b82f6')
              : '#94a3b8';

            return (
              <group key={pi} position={[palletX, 0.1, 0]}>
                {/* Wooden Pallet Base */}
                <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.4, 0.12, 1.1]} />
                  <meshStandardMaterial color="#92400e" roughness={0.9} />
                </mesh>

                {/* Cargo Boxes Stored */}
                {product && (
                  <group
                    position={[0, 0.45, 0]}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct({
                        ...product,
                        aisle: aisleName,
                        bay: `${aisleName}-${String(bayIndex + 1).padStart(2, '0')}`,
                        tier: level + 1,
                        slot: pi + 1
                      });
                    }}
                  >
                    <mesh castShadow receiveShadow>
                      <boxGeometry args={[1.2, 0.65, 0.95]} />
                      <meshStandardMaterial
                        color={boxColor}
                        metalness={0.3}
                        roughness={0.4}
                        emissive={isSelected ? '#38bdf8' : isLowStock ? '#f59e0b' : '#000000'}
                        emissiveIntensity={isSelected ? 0.8 : isLowStock ? (isNight ? 0.9 : 0.4) : 0}
                      />
                    </mesh>

                    {/* Active Selection Glow Ring */}
                    {isSelected && (
                      <mesh position={[0, 0.45, 0]}>
                        <ringGeometry args={[0.5, 0.65, 32]} />
                        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                      </mesh>
                    )}

                    {/* Small Barcode / Label on Front */}
                    <mesh position={[0, 0, 0.48]}>
                      <planeGeometry args={[0.6, 0.25]} />
                      <meshBasicMaterial color="#f8fafc" />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      ))}

      {/* Aisle & Bay Overhead Signboard */}
      <group position={[0, rackHeight + 0.35, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.4, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.2}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {`${aisleName}-${String(bayIndex + 1).padStart(2, '0')}`}
        </Text>
      </group>
    </group>
  );
}

// Full 3D Warehouse Interior Model
function WarehouseBuilding({ isNight }) {
  const floorWidth = 42;
  const floorLength = 36;

  return (
    <group>
      {/* Polished Concrete Warehouse Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorWidth, floorLength]} />
        <meshStandardMaterial
          color={isNight ? '#0b1120' : '#e2e8f0'}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Grid Floor Overlay for High-Tech feel */}
      <gridHelper
        args={[40, 40, isNight ? '#38bdf8' : '#64748b', isNight ? '#1e293b' : '#cbd5e1']}
        position={[0, 0.01, 0]}
      />

      {/* Forklift Safety Travel Lanes (Yellow Road Markings) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[2.8, floorLength - 4]} />
        <meshStandardMaterial
          color={isNight ? '#f59e0b' : '#d97706'}
          roughness={0.6}
          opacity={0.35}
          transparent
        />
      </mesh>

      {/* Inbound & Outbound Loading Docks at Back (Z: -16) */}
      {[-12, -4, 4, 12].map((x, idx) => (
        <group key={idx} position={[x, 0.02, -15.5]}>
          {/* Dock Staging Pad */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 4]} />
            <meshStandardMaterial color={isNight ? '#1e293b' : '#94a3b8'} roughness={0.7} />
          </mesh>
          {/* Dock Door Frame */}
          <mesh position={[0, 2.5, -2]}>
            <boxGeometry args={[4.5, 5, 0.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Overhead Dock Number Label */}
          <Text
            position={[0, 5.2, -1.9]}
            fontSize={0.4}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
          >
            {`BAY DOCK 0${idx + 1}`}
          </Text>
        </group>
      ))}

      {/* Structural Pillars along edges */}
      {[-18, 18].map((x, xi) =>
        [-12, -4, 4, 12].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 5, z]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 10, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function Warehouse3DScene({
  products = [],
  selectedProduct,
  onSelectProduct,
  isNight = false,
  cameraPreset = 'isometric'
}) {
  const controlsRef = useRef();

  // Camera preset positions
  useMemo(() => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    if (cameraPreset === 'isometric') {
      camera.position.set(22, 20, 24);
      controlsRef.current.target.set(0, 2, 0);
    } else if (cameraPreset === 'topdown') {
      camera.position.set(0, 32, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'aisle') {
      camera.position.set(-6, 3, 10);
      controlsRef.current.target.set(-6, 2, -5);
    } else if (cameraPreset === 'dock') {
      camera.position.set(0, 5, -8);
      controlsRef.current.target.set(0, 2, -15);
    }
    controlsRef.current.update();
  }, [cameraPreset]);

  // Arrange Racks into 4 Aisles: Aisle A, B, C, D
  const aisles = [
    { name: 'AISLE A', x: -11.5 },
    { name: 'AISLE B', x: -5.5 },
    { name: 'AISLE C', x: 5.5 },
    { name: 'AISLE D', x: 11.5 }
  ];

  return (
    <div className="w-full h-full relative select-none rounded-3xl overflow-hidden bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [22, 20, 24], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Sky / Environment Lighting */}
        <color attach="background" args={[isNight ? '#030712' : '#f1f5f9']} />
        {isNight && <fog attach="fog" args={['#030712', 20, 55]} />}

        {/* Ambient & Directional Sun/Lighting */}
        <ambientLight intensity={isNight ? 0.35 : 0.75} />
        <directionalLight
          position={[18, 30, 15]}
          intensity={isNight ? 0.6 : 1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
        />

        {/* Night Neon Warehouse Accent Lighting */}
        {isNight && (
          <>
            <pointLight position={[-10, 8, 0]} intensity={2.5} color="#38bdf8" distance={25} />
            <pointLight position={[10, 8, 0]} intensity={2.5} color="#a855f7" distance={25} />
            <pointLight position={[0, 8, -12]} intensity={2.0} color="#f59e0b" distance={20} />
          </>
        )}

        {/* Building Shell */}
        <WarehouseBuilding isNight={isNight} />

        {/* Animated Forklift */}
        <MovingAGV isNight={isNight} />

        {/* Storage Racks */}
        {aisles.map((aisle, aisleIdx) =>
          [-10, -5, 0, 5, 10].map((z, bayIdx) => {
            const productSliceIndex = (aisleIdx * 5 + bayIdx) * 6;
            const rackProducts = products.slice(productSliceIndex, productSliceIndex + 6);

            return (
              <RackUnit
                key={`${aisle.name}-${bayIdx}`}
                position={[aisle.x, 0, z]}
                aisleName={aisle.name}
                bayIndex={bayIdx}
                products={rackProducts.length > 0 ? rackProducts : products}
                selectedProduct={selectedProduct}
                onSelectProduct={onSelectProduct}
                isNight={isNight}
              />
            );
          })
        )}

        {/* Smooth Orbit Navigation */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={6}
          maxDistance={45}
        />
      </Canvas>
    </div>
  );
}
