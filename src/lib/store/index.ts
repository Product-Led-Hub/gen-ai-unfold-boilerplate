/**
 * @file lib/store/index.ts
 * @description Redux Toolkit store configuration.
 *
 * Slices:
 *  - `chat` (chatSlice) — legacy conversation state (kept for compatibility).
 *  - `settings` (settingsSlice) — all AI settings: provider, model, temperature,
 *    maxTokens, systemPrompt, API keys, local endpoints, useTools, useRAG.
 *
 * Typed hooks (always use these instead of raw `useDispatch` / `useSelector`):
 *  - `useAppDispatch()` — typed dispatch that knows about all action creators.
 *  - `useAppSelector(selector)` — typed selector with full RootState inference.
 *
 * How to use:
 * ```tsx
 * // In any client component:
 * import { useAppDispatch, useAppSelector } from "@/lib/store";
 * import { setTemperature } from "@/lib/store/slices/settingsSlice";
 *
 * const dispatch = useAppDispatch();
 * const temperature = useAppSelector((s) => s.settings.temperature);
 * dispatch(setTemperature(0.9));
 * ```
 *
 * The store is wrapped by `StoreProvider` in `src/lib/store/provider.tsx`
 * which is mounted in the root `layout.tsx`.
 */
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import chatReducer from "./slices/chatSlice";
import settingsReducer from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["chat/addMessage"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
