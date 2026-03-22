"use client";

import { useEffect, useState, type ComponentType } from "react";
import { cn } from "./ui/utils";

type LucideIconProps = React.SVGAttributes<SVGSVGElement> & { className?: string };

/**
 * Renders a Lucide icon only after mount to avoid hydration mismatch when
 * browser extensions (e.g. Dark Reader) inject attributes into SVGs before React hydrates.
 * Preserves layout with a same-size placeholder during SSR and initial paint.
 */
export function ClientOnlyIcon({
  icon: Icon,
  className,
  ...props
}: {
  icon: ComponentType<LucideIconProps>;
  className?: string;
} & Omit<LucideIconProps, "className">) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={cn("inline-block shrink-0", className)} aria-hidden />;
  }
  return <Icon className={className} {...props} />;
}
