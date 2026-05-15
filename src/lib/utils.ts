/**
 * @file lib/utils.ts
 * @description Shared utility functions.
 *
 * `cn(...classes)` — merges Tailwind CSS class names intelligently:
 *  - Uses `clsx` to handle conditional, array, and object class inputs.
 *  - Uses `tailwind-merge` to resolve conflicting Tailwind utilities
 *    (e.g. `px-2 px-4` → `px-4`, `text-red-500 text-blue-500` → `text-blue-500`).
 *
 * How to use:
 * ```ts
 * import { cn } from "@/lib/utils";
 *
 * <div className={cn("base-class", isActive && "active-class", className)} />
 * ```
 *
 * This is the standard shadcn/ui utility — all UI components use it.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
