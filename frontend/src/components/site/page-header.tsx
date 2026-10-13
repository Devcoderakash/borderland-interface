import type { ReactNode } from "react";

import { SystemLabel } from "@/components/site/bits";

export function PageHeader({
  code,
  title,
  subtitle,
  children,
}: {
  code: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="scanlines relative overflow-hidden void-bg px-4 pt-24 pb-8 sm:px-8 sm:pt-32 md:pt-36">
      <div className="grid-veil pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      {/* Contained ambient orbs — clipped to this header section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Crimson bloom — upper right */}
        <div
          className="ambient-orb-crimson"
          style={{
            width: "50%",
            height: "200%",
            top: "-60%",
            right: "-5%",
            opacity: 0.55,
            animationDelay: "-6s",
            animationDuration: "32s",
          }}
        />
        {/* Violet depth — lower left */}
        <div
          className="ambient-orb-violet"
          style={{
            width: "40%",
            height: "180%",
            bottom: "-80%",
            left: "-5%",
            opacity: 0.45,
            animationDelay: "-18s",
            animationDuration: "40s",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">{code}</SystemLabel>
        <h1 className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.08] break-words text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/75">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
      <div className="hair-line absolute bottom-0 inset-x-0" />
    </section>
  );
}
