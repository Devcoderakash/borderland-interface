import { useEffect, useRef } from "react";

/**
 * AmbientBackground
 *
 * A purely decorative, full-page ambient background layer rendered ONCE in the
 * root layout. It composites:
 *   1. Three slowly drifting radial orbs (crimson · violet · cyan)
 *   2. An animated aurora gradient mesh
 *   3. A soft mouse-follow glow (desktop only, respects prefers-reduced-motion)
 *
 * All layers use pointer-events:none and z-index:0, so they never interfere
 * with navigation, forms, or interactive content.
 *
 * The hero section already has its own CinematicHeroBackground with a higher
 * z-index; these ambient layers quietly complement it on all other pages.
 */
export function AmbientBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  // Mouse-follow glow — smooth RAF lerp, desktop only, reduced-motion safe
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    if (prefersReduced || isTouch || !glowRef.current) return;

    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      if (glowRef.current) {
        glowRef.current.style.setProperty("--gx", `${currentX.toFixed(1)}px`);
        glowRef.current.style.setProperty("--gy", `${currentY.toFixed(1)}px`);
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* ── Aurora gradient mesh ── */}
      <div className="ambient-aurora" />

      {/* ── Orb 1: Crimson — top-left quadrant ── */}
      <div
        className="ambient-orb-crimson"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: 700,
          maxHeight: 700,
          top: "-12%",
          left: "-10%",
          animationDelay: "0s",
        }}
      />

      {/* ── Orb 2: Violet — bottom-right quadrant ── */}
      <div
        className="ambient-orb-violet"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: 640,
          maxHeight: 640,
          bottom: "-15%",
          right: "-12%",
          animationDelay: "-12s",
        }}
      />

      {/* ── Orb 3: Cyan — mid-left accent ── */}
      <div
        className="ambient-orb-cyan"
        style={{
          width: "35vw",
          height: "35vw",
          maxWidth: 480,
          maxHeight: 480,
          top: "40%",
          left: "5%",
          animationDelay: "-22s",
        }}
      />

      {/* ── Orb 4: Crimson echo — top-right ── */}
      <div
        className="ambient-orb-crimson"
        style={{
          width: "30vw",
          height: "30vw",
          maxWidth: 400,
          maxHeight: 400,
          top: "10%",
          right: "5%",
          opacity: 0.6,
          animationDelay: "-8s",
          animationDuration: "34s",
        }}
      />

      {/* ── Mouse-follow glow (desktop) ── */}
      <div
        ref={glowRef}
        className="mouse-glow"
        style={
          {
            "--gx": "-9999px",
            "--gy": "-9999px",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
