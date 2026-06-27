import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
      {...props}
    />
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-white shadow-soft", className)} {...props} />;
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}
