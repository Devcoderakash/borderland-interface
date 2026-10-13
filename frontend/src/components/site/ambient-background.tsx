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
      {/* ── Layer 1: Atmospheric Aurora Mesh ── */}
      <div className="ambient-aurora-mesh" />

      {/* ── Layer 2: Subtle Digital Cyber-Grid with Wave Pulse ── */}
      <div className="ambient-cyber-grid" />

      {/* ── Layer 3: Cinema Light Beam Drift ── */}
      <div className="ambient-light-beam" />

      {/* ── Layer 4: Harmonic Floating Ambient Orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Orb 1: Crimson Nova — top-left quadrant */}
        <div
          className="ambient-orb-crimson"
          style={{
            width: "55vw",
            height: "55vw",
            maxWidth: 750,
            maxHeight: 750,
            top: "-14%",
            left: "-12%",
            animationDelay: "0s",
          }}
        />

        {/* Orb 2: Violet Eclipse — bottom-right quadrant */}
        <div
          className="ambient-orb-violet"
          style={{
            width: "52vw",
            height: "52vw",
            maxWidth: 680,
            maxHeight: 680,
            bottom: "-16%",
            right: "-12%",
            animationDelay: "-14s",
          }}
        />

        {/* Orb 3: Cyan Pulse — mid-left accent */}
        <div
          className="ambient-orb-cyan"
          style={{
            width: "38vw",
            height: "38vw",
            maxWidth: 500,
            maxHeight: 500,
            top: "38%",
            left: "4%",
            animationDelay: "-24s",
          }}
        />

        {/* Orb 4: Warm Rose / Amber Core — top-right quadrant */}
        <div
          className="ambient-orb-amber"
          style={{
            width: "36vw",
            height: "36vw",
            maxWidth: 460,
            maxHeight: 460,
            top: "8%",
            right: "4%",
            animationDelay: "-9s",
          }}
        />
      </div>

      {/* ── Layer 5: Interactive Cursor Resonance (Desktop) ── */}
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
