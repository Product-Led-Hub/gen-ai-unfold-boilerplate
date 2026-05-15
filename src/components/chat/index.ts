/**
 * @file components/chat/index.ts
 * @description Barrel file — re-exports every public symbol from the chat
 * component folder so consumers can import from `"@/components/chat"` instead
 * of deep paths.
 *
 * Usage:
 * ```ts
 * import { ChatPanel, ChatInput, ChatMessages, SessionsSidebar } from "@/components/chat";
 * ```
 */
export { ChatMessages } from "./ChatMessages";
export { ChatInput } from "./ChatInput";
export { ProviderSelector } from "./ProviderSelector";
export { FeaturesToggle } from "./FeaturesToggle";
export { ChatPanel } from "./ChatPanel";
export { SessionsSidebar } from "./SessionsSidebar";
export type { Session } from "./SessionsSidebar";
