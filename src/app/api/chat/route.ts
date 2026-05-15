import { streamText, createTextStreamResponse, convertToModelMessages } from "ai";
import type { ModelMessage, UIMessage } from "ai";
import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/ai/schemas";
import { getModel } from "@/lib/ai/providers";
import { allTools } from "@/lib/ai/tools";
import { retrieveContext, buildRAGSystemPrompt, getDocumentCount } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    // ── STEP 1: Parse & validate the request body with Zod ─────────────────
    // chatRequestSchema rejects bad input before it reaches any AI call.
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const {
      messages,
      provider,
      model,
      temperature,
      maxTokens,
      systemPrompt,
      useTools,
      useRAG,
      ragEmbeddingProvider,
      localEndpoint,
      historyLimit,
    } = validated;

    // ── STEP 2: Convert UIMessages → ModelMessages ───────────────────────────
    // useChat sends UIMessage format (parts, id, attachments).
    // streamText requires ModelMessage format (content string or parts array).
    // convertToModelMessages() is the official SDK conversion function.
    const allCoreMessages = await convertToModelMessages(messages as unknown as UIMessage[]);
    // Slice to the last `historyLimit` messages so older turns are dropped.
    // historyLimit 0 means send no history (only the current message).
    const coreMessages =
      historyLimit > 0
        ? allCoreMessages.slice(-historyLimit)
        : allCoreMessages.slice(-1);

    // ── STEP 3: Build system prompt — optionally augmented with RAG context ─
    // If RAG is enabled and documents exist, embed the last user message,
    // retrieve the top-3 closest chunks, and prepend them to the system prompt.
    let finalSystemPrompt = systemPrompt ?? "You are a helpful AI assistant.";

    if (useRAG) {
      console.log(`[RAG] enabled — vector store has ${getDocumentCount()} chunks`);
    }
    if (useRAG && getDocumentCount() > 0) {
      // Extract plain text from the last user UIMessage.
      // UIMessages carry text in `parts`, CoreMessages carry it in `content`.
      const lastUIMsg = [...messages].reverse().find((m) => m.role === "user") as unknown as UIMessage | undefined;
      const parts = lastUIMsg?.parts as Array<{ type: string; text?: string }> | undefined;
      const rawContent = (lastUIMsg as unknown as Record<string, unknown>)?.content;
      const lastUserMessage = parts
        ? parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("")
        : typeof rawContent === "string"
          ? rawContent
          : "";

      const { contextText, sources } = await retrieveContext(lastUserMessage, {
        topK: 3,
        embeddingProvider: ragEmbeddingProvider ?? "lmstudio",
      });

      console.log(`[RAG] query: "${lastUserMessage.slice(0, 80)}" → ${sources.length} chunks retrieved`);
      if (sources.length > 0) {
        console.log(`[RAG] top scores: ${sources.map((s) => s.score).join(", ")}`);
      }

      if (contextText) {
        finalSystemPrompt = buildRAGSystemPrompt(contextText, finalSystemPrompt);
        console.log(
          `[RAG] Retrieved ${sources.length} chunks for query: "${lastUserMessage.slice(0, 60)}..."`
        );
      }
    }

    const formattedMessages: ModelMessage[] = [
      { role: "system", content: finalSystemPrompt },
      ...coreMessages,
    ];

    // ── STEP 4: Pick the right model via the provider factory ───────────────
    // Priority for local provider baseURL:
    //   1. localEndpoint from the UI (user-configured in the sidebar)
    //   2. LMSTUDIO_BASE_URL / OLLAMA_BASE_URL environment variable
    //   3. Hardcoded default (localhost:1234 or localhost:11434)
    const aiModel = getModel({
      provider,
      model,
      config: {
        baseURL: localEndpoint || undefined,
      },
    });

    // ── STEP 5: Stream — with optional tool calling ─────────────────────────
    // maxSteps: 5 lets the model call multiple tools before the final answer
    // (agentic loop). Remove it to disable multi-step reasoning.
    const result = await streamText({
      model: aiModel,
      messages: formattedMessages,
      temperature,
      maxOutputTokens: maxTokens,
      ...(useTools && { tools: allTools, maxSteps: 5 }),
    });

    // ── STEP 5: Return a streaming HTTP response ────────────────────────────
    // Tokens arrive at the client as they are generated — no waiting.
    return createTextStreamResponse({
      textStream: result.textStream,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid request format", details: error },
        { status: 400 }
      );
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
