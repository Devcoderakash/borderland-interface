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
    <section className="scanlines relative overflow-hidden void-bg px-5 pt-32 pb-14 sm:px-8 md:pt-40">
      <div className="grid-veil pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <SystemLabel className="text-primary">{code}</SystemLabel>
        <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[1.02] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
