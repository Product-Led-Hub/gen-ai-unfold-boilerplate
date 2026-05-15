/**
 * @file lib/ai/index.ts
 * @description Barrel file — re-exports the public AI module API.
 *
 * Re-exports:
 *  - Everything from `providers.ts` (provider types, `getModel`, model lists).
 *  - Everything from `schemas.ts` (Zod schemas for API validation).
 *
 * Usage:
 * ```ts
 * import { getModel, chatRequestSchema, AIProvider } from "@/lib/ai";
 * ```
 */
export * from "./providers";
export * from "./schemas";
