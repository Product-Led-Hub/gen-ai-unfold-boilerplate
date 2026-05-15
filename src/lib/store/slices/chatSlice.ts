/**
 * @file lib/store/slices/chatSlice.ts
 * @description Redux slice for in-memory conversation state.
 *
 * NOTE: This slice is kept for backwards compatibility and bootcamp exercises.
 * In the current application, chat history is persisted in SQLite and loaded
 * into `useChat` via `ChatPanel`. This slice is not actively written to by the
 * main chat flow — use it as a starting point for your own features.
 *
 * State shape:
 * ```ts
 * {
 *   conversations: Conversation[];   // all in-memory conversations
 *   activeConversationId: string | null;
 *   isLoading: boolean;
 *   error: string | null;
 * }
 * ```
 *
 * Actions:
 *  - `createConversation({ id, title? })` — create and activate a new conversation.
 *  - `setActiveConversation(id)` — switch the active conversation.
 *  - `addMessage({ conversationId, message })` — push a message into a conversation.
 *  - `setLoading(bool)` — toggle the loading state.
 *  - `setError(string | null)` — set or clear an error.
 *  - `clearConversations()` — wipe all in-memory conversations.
 *
 * Extension ideas:
 *  - Sync this slice to SQLite via a Redux middleware or `useEffect`.
 *  - Add an `editMessage` action to support message editing.
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  tokenCount?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createConversation: (state, action: PayloadAction<{ id: string; title?: string }>) => {
      const newConversation: Conversation = {
        id: action.payload.id,
        title: action.payload.title || "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.conversations.unshift(newConversation);
      state.activeConversationId = newConversation.id;
    },
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.updatedAt = new Date().toISOString();
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        content: string;
      }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        const message = conversation.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.content = action.payload.content;
        }
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload
      );
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  createConversation,
  setActiveConversation,
  addMessage,
  updateMessage,
  deleteConversation,
  setLoading,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
