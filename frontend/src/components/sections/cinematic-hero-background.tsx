import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  speedY: number;
  speedX: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorRgb: string;
  depth: number;
}

export function CinematicHeroBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse Parallax (smooth 60fps via RAF + CSS variables, avoids React re-renders)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    if (prefersReducedMotion || isTouchDevice) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1] relative to window center
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      // Smooth damping (lerp)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (rootRef.current) {
        rootRef.current.style.setProperty("--m-x", currentX.toFixed(4));
        rootRef.current.style.setProperty("--m-y", currentY.toFixed(4));
      }
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Floating Atmospheric Particles Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let animationId: number;
    let isVisible = true;

    // Sparse, cinematic particle density
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 14 : 32;

    const colors = [
      "225, 29, 72", // Crimson Red (primary)
      "225, 29, 72",
      "244, 63, 94", // Rose Red
      "251, 146, 60", // Muted Amber Ember
      "240, 240, 255", // Silver White Dust
    ];

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const colorRgb = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 1.8 + 0.8;
        const depth = Math.random() * 0.8 + 0.4; // 0.4 to 1.2
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseOpacity: Math.random() * 0.45 + 0.2,
          opacity: 0.3,
          speedY: -(Math.random() * 0.25 + 0.12) * depth,
          speedX: (Math.random() - 0.5) * 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
          colorRgb,
          depth,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      } else {
        // Clamp particles inside new bounds
        particles.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Pause when hero is not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);

    // Pause when tab is inactive
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      time += 0.015;

      // Extract current mouse parallax from CSS variable if available
      let mx = 0;
      let my = 0;
      if (rootRef.current) {
        mx = parseFloat(rootRef.current.style.getPropertyValue("--m-x") || "0");
        my = parseFloat(rootRef.current.style.getPropertyValue("--m-y") || "0");
      }

      particles.forEach((p) => {
        if (!prefersReduced) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(time + p.pulsePhase) * 0.12;

          // Wrap around top/bottom/sides
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        // Gentle breathing opacity
        const pulse = Math.sin(time * 2 + p.pulsePhase) * 0.18;
        p.opacity = Math.max(0.1, Math.min(0.85, p.baseOpacity + pulse));

        // Parallax offset applied to particle position
        const drawX = p.x + mx * p.depth * 14;
        const drawY = p.y + my * p.depth * 8;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${p.opacity.toFixed(3)})`;

        // Soft atmospheric glow for larger particles
        if (p.size > 1.4) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${p.colorRgb}, 0.6)`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
      style={
        {
          "--m-x": "0",
          "--m-y": "0",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* ---------------- 1. MOUNTAIN BASE LAYER (Preserved, with subtle mouse parallax) ---------------- */}
      <div
        className="absolute inset-[-4%] will-change-transform transition-transform duration-200 ease-out"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -6px), calc(var(--m-y, 0) * -4px), 0) scale(1.04)",
        }}
      >
        <img
          src="/hero-bg-apex.jpg"
          alt="Cinematic Peak"
          className="h-full w-full object-cover object-[62%_center] sm:object-center"
          loading="eager"
        />
      </div>

      {/* ---------------- 2. CRIMSON ATMOSPHERIC GLOW (Breathing behind central peak & horizon) ---------------- */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -10px), calc(var(--m-y, 0) * -6px), 0)",
        }}
      >
        {/* Core crimson radial bloom behind peak */}
        <div
          className="absolute inset-0 animate-apex-crimson-breathe"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 64% 44%, rgba(225, 29, 72, 0.44) 0%, rgba(180, 15, 50, 0.22) 35%, rgba(120, 10, 40, 0.08) 60%, transparent 80%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Deep ambient horizon backlight */}
        <div
          className="absolute bottom-1/4 left-0 right-0 h-96 opacity-60 animate-apex-crimson-breathe"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(225, 29, 72, 0.25) 0%, rgba(159, 18, 57, 0.12) 40%, transparent 75%)",
            mixBlendMode: "screen",
            animationDelay: "-4s",
          }}
        />
      </div>

      {/* ---------------- 3. SLOWLY MOVING ATMOSPHERIC CLOUDS (Dual-layered drift) ---------------- */}
      {/* Cloud Layer 1: Distant upper clouds (drifting right-to-left slowly) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -14px), calc(var(--m-y, 0) * -8px), 0)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 50%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 50%, transparent 85%)",
        }}
      >
        <div className="absolute top-0 left-0 h-[65%] w-[200%] flex animate-apex-cloud-slow opacity-25 mix-blend-screen">
          <div className="h-full w-1/2 apex-cloud-texture-1" />
          <div className="h-full w-1/2 apex-cloud-texture-1" />
        </div>
      </div>

      {/* Cloud Layer 2: Mid-atmospheric drifting clouds */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -20px), calc(var(--m-y, 0) * -12px), 0)",
          maskImage:
            "linear-gradient(to bottom, transparent 5%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.7) 65%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 5%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.7) 65%, transparent 90%)",
        }}
      >
        <div className="absolute top-[8%] left-0 h-[55%] w-[200%] flex animate-apex-cloud-fast opacity-20 mix-blend-screen">
          <div className="h-full w-1/2 apex-cloud-texture-2" />
          <div className="h-full w-1/2 apex-cloud-texture-2" />
        </div>
      </div>

      {/* ---------------- 4. VOLUMETRIC FOG & MOUNTAIN MIST (Lower terrain & horizon) ---------------- */}
      <div
        className="absolute bottom-[8%] left-0 right-0 h-[48%] will-change-transform"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -16px), calc(var(--m-y, 0) * -10px), 0)",
          maskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.85) 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.85) 75%, transparent 100%)",
        }}
      >
        {/* Mist Layer A: Drifts right to left with vertical undulating waves */}
        <div className="absolute inset-0 w-[200%] flex animate-apex-mist-drift-1 opacity-30 mix-blend-screen">
          <div className="h-full w-1/2 apex-mist-texture-1 animate-apex-mist-float-1" />
          <div className="h-full w-1/2 apex-mist-texture-1 animate-apex-mist-float-1" />
        </div>

        {/* Mist Layer B: Counter-drifting lower fog */}
        <div className="absolute bottom-0 left-0 h-[70%] w-[200%] flex animate-apex-mist-drift-2 opacity-25 mix-blend-overlay">
          <div className="h-full w-1/2 apex-mist-texture-2 animate-apex-mist-float-2" />
          <div className="h-full w-1/2 apex-mist-texture-2 animate-apex-mist-float-2" />
        </div>
      </div>

      {/* ---------------- 5. FUTURISTIC AMBIENT LIGHTING SWEEP (Subtle, infrequent beam across peak) ---------------- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -inset-y-10 -left-1/3 w-2/3 animate-apex-light-sweep opacity-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 38%, rgba(225, 29, 72, 0.16) 48%, rgba(251, 146, 60, 0.08) 52%, transparent 62%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* ---------------- 6. FLOATING ATMOSPHERIC PARTICLES CANVAS ---------------- */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none mix-blend-screen opacity-90"
      />

      {/* ---------------- 7. HORIZON ILLUMINATION ACCENT LINE ---------------- */}
      <div
        className="absolute bottom-[28%] left-0 right-0 h-[1px] animate-apex-horizon-glow pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(225, 29, 72, 0.3) 30%, rgba(251, 146, 60, 0.45) 55%, rgba(225, 29, 72, 0.3) 70%, transparent 100%)",
        }}
      />

      {/* ---------------- 8. PRESERVED ORIGINAL READABILITY OVERLAYS & TECHNICAL GRID ---------------- */}
      {/* Dark Gradients for typography sharpness & contrast (Left text remains 100% crisp) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30 sm:via-background/90 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent sm:via-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Red Atmospheric Tint Blend */}
      <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />

      {/* Preserved Technical Grid with Subtle Breathing */}
      <div
        className="absolute inset-0 grid-veil animate-apex-grid-breathe"
        aria-hidden="true"
      />

      {/* Subtle Cinematic Film Grain */}
      <div className="absolute inset-0 grain" aria-hidden="true" />
    </div>
  );
}
