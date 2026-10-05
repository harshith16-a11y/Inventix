import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function AdminInteractive3DBackdrop() {
  const [tintMode, setTintMode] = useState('vivid'); // 'vivid' | 'deep'

  // Ref for zero-render 60fps physics & telemetry
  const animRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    cursorX: -100,
    cursorY: -100,
    isIdle: false,
    rafId: null,
    fps: 60,
    lastFrameTime: performance.now(),
    frameCount: 0
  });

  const fullBgRef = useRef(null);
  const ambientGlowRef = useRef(null);
  const specularSweepRef = useRef(null);
  const hudCoordsRef = useRef(null);
  const hudFpsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      const state = animRef.current;
      state.targetX = normX;
      state.targetY = normY;
      state.cursorX = e.clientX;
      state.cursorY = e.clientY;

      // Wake up animation loop if it was resting
      if (state.isIdle) {
        state.isIdle = false;
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const renderLoop = (timestamp) => {
      const state = animRef.current;

      // Calculate real-time FPS
      state.frameCount++;
      if (timestamp - state.lastFrameTime >= 500) {
        state.fps = Math.round((state.frameCount * 1000) / (timestamp - state.lastFrameTime));
        state.frameCount = 0;
        state.lastFrameTime = timestamp;
        if (hudFpsRef.current) {
          hudFpsRef.current.innerText = `${state.fps} FPS`;
        }
      }

      // Smooth springy easing (lerp)
      const diffX = state.targetX - state.currentX;
      const diffY = state.targetY - state.currentY;
      state.currentX += diffX * 0.07;
      state.currentY += diffY * 0.07;

      // 1. Tilt the FULL Background Canvas in 3D perspective with zero re-renders
      if (fullBgRef.current) {
        const rotY = state.currentX * 10;  // 10 deg horizontal tilt
        const rotX = -state.currentY * 7;   // 7 deg vertical tilt
        const transX = state.currentX * 22; // 22px parallax shift
        const transY = state.currentY * 16; // 16px parallax shift

        fullBgRef.current.style.transform = `
          perspective(1200px)
          scale(1.08)
          rotateY(${rotY}deg)
          rotateX(${rotX}deg)
          translate3d(${transX}px, ${transY}px, 0px)
        `;
      }

      // 2. Cursor light glow follows mouse movement
      if (ambientGlowRef.current) {
        ambientGlowRef.current.style.transform = `translate3d(${state.cursorX - 280}px, ${state.cursorY - 280}px, 0px)`;
      }

      // 3. Dynamic specular highlight across the warehouse roof and racks
      if (specularSweepRef.current) {
        const angle = 120 + state.currentX * 40;
        specularSweepRef.current.style.background = `linear-gradient(${angle}deg, rgba(168, 85, 247, 0.22) 0%, rgba(245, 158, 11, 0.12) 40%, transparent 70%)`;
      }

      // 4. Update HUD coordinates directly without React re-render
      if (hudCoordsRef.current) {
        hudCoordsRef.current.innerText = `${Math.round(state.currentX * 100)}°X ${Math.round(state.currentY * 100)}°Y`;
      }

      // Check if velocity is small enough to rest loop (saves 100% CPU when idle)
      const velocity = Math.abs(diffX) + Math.abs(diffY);
      if (velocity < 0.0005) {
        state.isIdle = true;
      } else {
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    animRef.current.rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animRef.current.rafId) {
        cancelAnimationFrame(animRef.current.rafId);
      }
    };
  }, []);

  return (
    <>
      {/* ========================================================
          1. 3D CURSOR AMBIENT LIGHT (Standard native cursor preserved)
          ======================================================== */}
      <div
        ref={ambientGlowRef}
        className="fixed top-0 left-0 w-[560px] h-[560px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-45 blur-3xl will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(245, 158, 11, 0.25) 40%, transparent 75%)'
        }}
      />

      {/* ========================================================
          2. FULL-PAGE UNBLURRED 3D WAREHOUSE BACKGROUND
          ======================================================== */}
      <div className="fixed inset-0 w-full h-full overflow-hidden select-none -z-20 pointer-events-none">
        
        {/* Full-bleed 3D Image Canvas with Hardware Acceleration */}
        <div
          ref={fullBgRef}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center'
          }}
        >
          {/* THE IMAGE FULL IN THE BACKGROUND - NOT BLURRED, CRISP & SHARP */}
          <img
            src="/images/inventix-admin-warehouse.jpg"
            alt="INVENTIX Surreal Warehouse Architecture"
            className="w-full h-full object-cover object-center select-none"
            style={{
              filter: 'contrast(108%) brightness(96%) saturate(106%)'
            }}
          />

          {/* Dynamic 3D Specular Light Sheen reflecting cursor angle */}
          <div
            ref={specularSweepRef}
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60 transition-opacity"
          />

          {/* Futuristic Cyber Scanning Line Animation */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(245, 158, 11, 0.15) 50%, transparent 100%)',
              backgroundSize: '100% 200px',
              animation: 'inventixCyberScan 8s linear infinite'
            }}
          />

          {/* Futuristic Cyber Grid Matrix Overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* ========================================================
            3. SHEER CONTRAST SCRIM (Zero Blur so image is fully sharp)
            ======================================================== */}
        <div
          className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
            tintMode === 'vivid'
              ? 'bg-slate-950/45'
              : 'bg-slate-950/70'
          }`}
        />
      </div>

      {/* ========================================================
          4. FUTURISTIC TELEMETRY HUD STRIP (Bottom Right)
          ======================================================== */}
      <div className="fixed bottom-4 right-4 sm:right-6 z-40 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-[11px] shadow-xl select-none text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-extrabold text-white flex items-center gap-1.5 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>QUANTUM OS</span>
        </span>
        <span className="text-slate-600">|</span>

        {/* Real-time FPS Monitor */}
        <span ref={hudFpsRef} className="font-mono text-emerald-400 font-bold text-[10px]">
          60 FPS
        </span>
        <span className="text-slate-600">|</span>

        {/* High-speed Real-time Coordinates */}
        <span ref={hudCoordsRef} className="font-mono text-amber-300/90 text-[10px]">
          0°X 0°Y
        </span>
        <span className="text-slate-600">|</span>

        {/* Contrast Preset Mode Switcher */}
        <button
          onClick={() => setTintMode(tintMode === 'vivid' ? 'deep' : 'vivid')}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 transition-colors pointer-events-auto font-mono"
          title="Toggle Background Contrast Preset"
        >
          {tintMode === 'vivid' ? 'Vivid 3D' : 'High Contrast'}
        </button>
      </div>
    </>
  );
}
