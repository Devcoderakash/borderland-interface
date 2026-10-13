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

        // Soft atmospheric glow for larger particles (desktop only for performance)
        if (!isMobile && p.size > 1.4) {
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
      {/* ---------------- 1. MOUNTAIN BASE LAYER (Responsive Mobile & Desktop Sci-Fi Art) ---------------- */}
      <div
        className="absolute inset-[-4%] will-change-transform transition-transform duration-200 ease-out"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -6px), calc(var(--m-y, 0) * -4px), 0) scale(1.04)",
        }}
      >
        <picture className="h-full w-full">
          <source media="(max-width: 767px)" srcSet="/hero-bg-mobile.jpg" />
          <source media="(min-width: 768px)" srcSet="/hero-bg-desktop.jpg" />
          <img
            src="/hero-bg-mobile.jpg"
            alt="APEX 1.0 Cinematic Mountain Peak"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </picture>
      </div>

      {/* ---------------- 2. PLANETARY ARC & CRIMSON ATMOSPHERIC GLOW ---------------- */}
      <div
        className="absolute inset-0 will-change-transform pointer-events-none"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -10px), calc(var(--m-y, 0) * -6px), 0)",
        }}
      >
        {/* Glowing Planetary Arc Pulse Behind Mountain Peak */}
        <div
          className="absolute top-[16%] left-1/2 w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] rounded-full animate-apex-arc-glow pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 35, 69, 0.32) 0%, rgba(225, 29, 72, 0.16) 45%, transparent 72%)",
            mixBlendMode: "screen",
            filter: "blur(20px)",
          }}
        />

        {/* Deep ambient horizon backlight */}
        <div
          className="absolute bottom-1/4 left-0 right-0 h-96 opacity-60 animate-apex-crimson-breathe pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(225, 29, 72, 0.25) 0%, rgba(159, 18, 57, 0.12) 40%, transparent 75%)",
            mixBlendMode: "screen",
            animationDelay: "-4s",
          }}
        />
      </div>

      {/* ---------------- 3. MOVING LIGHT STREAKS (Shooting stars across the cosmic sky) ---------------- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] -left-16 h-[1.5px] w-36 bg-gradient-to-r from-transparent via-[#FF2345] to-transparent animate-apex-shooting-star-1 opacity-85" />
        <div className="absolute top-[24%] -left-16 h-[1px] w-28 bg-gradient-to-r from-transparent via-rose-300 to-transparent animate-apex-shooting-star-2 opacity-65" />
      </div>

      {/* ---------------- 4. SLOWLY MOVING ATMOSPHERIC CLOUDS (Dual-layered drift) ---------------- */}
      <div
        className="absolute inset-0 will-change-transform pointer-events-none"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -14px), calc(var(--m-y, 0) * -8px), 0)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 50%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 50%, transparent 85%)",
        }}
      >
        <div className="absolute top-0 left-0 h-[65%] w-[200%] flex animate-apex-cloud-slow opacity-20 mix-blend-screen">
          <div className="h-full w-1/2 apex-cloud-texture-1" />
          <div className="h-full w-1/2 apex-cloud-texture-1" />
        </div>
      </div>

      {/* ---------------- 5. VOLUMETRIC FOG & MOUNTAIN MIST ---------------- */}
      <div
        className="absolute bottom-[8%] left-0 right-0 h-[48%] will-change-transform pointer-events-none"
        style={{
          transform:
            "translate3d(calc(var(--m-x, 0) * -16px), calc(var(--m-y, 0) * -10px), 0)",
          maskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.85) 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.85) 75%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 w-[200%] flex animate-apex-mist-drift-1 opacity-25 mix-blend-screen">
          <div className="h-full w-1/2 apex-mist-texture-1 animate-apex-mist-float-1" />
          <div className="h-full w-1/2 apex-mist-texture-1 animate-apex-mist-float-1" />
        </div>
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

      {/* ---------------- 8. READABILITY OVERLAYS & TECHNICAL GRID ---------------- */}
      {/* Top and bottom subtle vignettes for text contrast while preserving mountain & glowing lava river */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08070B]/75 via-transparent to-[#08070B]/80 pointer-events-none" />
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#08070B]/60 via-[#08070B]/30 to-transparent pointer-events-none" />

      {/* Preserved Technical Grid with Subtle Breathing */}
      <div
        className="absolute inset-0 grid-veil animate-apex-grid-breathe opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Cinematic Film Grain */}
      <div className="absolute inset-0 grain opacity-40 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
