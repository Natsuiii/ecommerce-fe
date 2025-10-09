"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: IconType;
  className?: string;
  hint?: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  className,
  hint,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "p-4 md:p-5 flex flex-col gap-3",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-muted/40">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <span className="text-xs font-medium">{title}</span>

      <div className="text-2xl font-bold tracking-tight">{value}</div>

      {hint ? (
        <div className="text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
