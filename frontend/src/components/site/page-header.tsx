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
      <div className="relative mx-auto max-w-6xl">
        <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">{code}</SystemLabel>
        <h1 className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.08] break-words">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
