import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, Zap, Sliders, Cpu } from 'lucide-react';

export default function UserInteractive3DBackdrop() {
  const [glassMode, setGlassMode] = useState('vivid'); // 'vivid' | 'frosted' | 'focus'
  const [clickCount, setClickCount] = useState(0);

  // Ref for zero-rerender 60fps physics & telemetry
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

  const fullBgContainerRef = useRef(null);
  const spotlightRef = useRef(null);
  const specularSheenRef = useRef(null);
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

      // Wake up loop if resting
      if (state.isIdle) {
        state.isIdle = false;
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const renderLoop = (timestamp) => {
      const state = animRef.current;

      // FPS tracking
      state.frameCount++;
      if (timestamp - state.lastFrameTime >= 500) {
        state.fps = Math.round((state.frameCount * 1000) / (timestamp - state.lastFrameTime));
        state.frameCount = 0;
        state.lastFrameTime = timestamp;
        if (hudFpsRef.current) {
          hudFpsRef.current.innerText = `${state.fps} FPS`;
        }
      }

      // Smooth physics easing (lerp)
      const diffX = state.targetX - state.currentX;
      const diffY = state.targetY - state.currentY;
      state.currentX += diffX * 0.07;
      state.currentY += diffY * 0.07;

      // 1. Tilt the FULL Background Canvas in 3D perspective
      if (fullBgContainerRef.current) {
        const rotY = state.currentX * 12; // 12 deg tilt
        const rotX = -state.currentY * 9;  // 9 deg tilt
        const transX = state.currentX * 24; // 24px parallax shift
        const transY = state.currentY * 18; // 18px parallax shift

        fullBgContainerRef.current.style.transform = `
          perspective(1000px)
          scale(1.08)
          rotateY(${rotY}deg)
          rotateX(${rotX}deg)
          translate3d(${transX}px, ${transY}px, 0px)
        `;
      }

      // 2. Update Dynamic Cursor Spotlight Glow
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${state.cursorX - 280}px, ${state.cursorY - 280}px, 0px)`;
      }

      // 3. Update 3D Specular Light Sheen reflecting cursor
      if (specularSheenRef.current) {
        const angle = 120 + state.currentX * 45;
        specularSheenRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.45) 0%, transparent 55%)`;
      }

      // 4. Update HUD coordinates directly without React re-render
      if (hudCoordsRef.current) {
        hudCoordsRef.current.innerText = `${Math.round(state.currentX * 100)}°X ${Math.round(state.currentY * 100)}°Y`;
      }

      // Sleep loop when velocity is near zero to save 100% CPU
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

  const handleConfetti = (e) => {
    e.stopPropagation();
    setClickCount((prev) => prev + 1);
    const state = animRef.current;
    confetti({
      particleCount: 50,
      spread: 75,
      origin: {
        x: (state.cursorX || window.innerWidth * 0.5) / window.innerWidth,
        y: (state.cursorY || window.innerHeight * 0.4) / window.innerHeight
      },
      colors: ['#FF6B00', '#FFA500', '#FF3D00', '#8B5CF6', '#F43F5E']
    });
  };

  // Glassmorphic readability styling configurations
  const glassStyles = {
    vivid: 'bg-black/10 dark:bg-black/35 backdrop-blur-[0.5px]',
    frosted: 'bg-white/65 dark:bg-slate-950/70 backdrop-blur-[4px]',
    focus: 'bg-white/88 dark:bg-slate-950/90 backdrop-blur-[10px]'
  };

  return (
    <>
      {/* ========================================================
          1. 3D AMBIENT LIGHT (Standard native cursor preserved)
          ======================================================== */}
      <div
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[560px] h-[560px] rounded-full pointer-events-none -z-10 mix-blend-screen opacity-50 dark:opacity-35 blur-3xl will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(255, 122, 0, 0.55) 0%, rgba(244, 63, 94, 0.25) 40%, rgba(139, 92, 246, 0.12) 70%, transparent 80%)'
        }}
      />

      {/* ========================================================
          2. FULL-SCREEN 3D BACKDROP IMAGE WITH TILT & DEPTH
          ======================================================== */}
      <div className="fixed inset-0 w-full h-full overflow-hidden select-none -z-20 pointer-events-none">
        
        {/* Full-bleed 3D Image Canvas with Hardware Acceleration */}
        <div
          ref={fullBgContainerRef}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center'
          }}
        >
          {/* Base vibrant orange studio atmosphere matching the image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00] via-[#FF7800] to-[#E65100]" />

          {/* THE 3D PICTURE FULL IN THE BACKGROUND */}
          <img
            src="/images/inventix-3d-cart.png"
            alt="INVENTIX 3D Intelligent Retail & Logistics Twin Background"
            className="w-full h-full object-cover object-center select-none"
            style={{
              filter: 'contrast(106%) saturate(108%) drop-shadow(0 20px 35px rgba(0,0,0,0.22))'
            }}
          />

          {/* Dynamic 3D Specular Light Sheen reflecting cursor movement */}
          <div
            ref={specularSheenRef}
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35 transition-opacity"
          />

          {/* Futuristic Cyber Scanning Line Animation */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)',
              backgroundSize: '100% 240px',
              animation: 'inventixCyberScan 9s linear infinite'
            }}
          />

          {/* Subtle 3D Geometric Depth Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        {/* Floating 3D Companion Elements layered over background */}
        <div className="absolute top-20 right-8 sm:right-24 md:right-32 pointer-events-auto">
          <div
            onClick={handleConfetti}
            className="cursor-pointer group flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-black shadow-xl border border-white/40 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
            title="Click 3D Special Tag for Celebration!"
          >
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse" />
            <span>% 3D SPECIAL DISPATCH</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-mono">
              {clickCount > 0 ? clickCount : 'Tap'}
            </span>
          </div>
        </div>

        {/* Floating 3D Smiley Coin */}
        <div
          className="absolute top-36 left-6 sm:left-16 pointer-events-none hidden sm:block"
        >
          <div className="w-12 h-12 rounded-full bg-white/95 dark:bg-slate-900/90 border border-amber-200/80 shadow-2xl flex items-center justify-center text-2xl select-none animate-float">
            😊
          </div>
        </div>

        {/* Readability Glass Scrim */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${glassStyles[glassMode]}`}
        />
      </div>

      {/* ========================================================
          4. FUTURISTIC TELEMETRY HUD PILL
          ======================================================== */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-orange-500/30 dark:border-orange-500/40 text-[11px] shadow-lg select-none">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
        <span className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span>SPATIAL TWIN</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Real-time FPS Monitor */}
        <span ref={hudFpsRef} className="font-mono text-emerald-500 font-bold text-[10px]">
          60 FPS
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        
        {/* Quick Glass Opacity Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setGlassMode('vivid')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              glassMode === 'vivid'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Maximum 3D Image Visibility"
          >
            Vivid
          </button>
          <button
            onClick={() => setGlassMode('frosted')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              glassMode === 'frosted'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Balanced Frosted Glass"
          >
            Glass
          </button>
          <button
            onClick={() => setGlassMode('focus')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              glassMode === 'focus'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="High Contrast Reading"
          >
            Focus
          </button>
        </div>

        <span ref={hudCoordsRef} className="hidden sm:inline font-mono text-[10px] text-slate-400">
          0°X 0°Y
        </span>
      </div>
    </>
  );
}
