import { streamText, createTextStreamResponse } from "ai";
import { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/ai/schemas";
import { getModel } from "@/lib/ai/providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const { messages, provider, model, temperature, maxTokens, systemPrompt } =
      validated;

    const formattedMessages = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    const aiModel = getModel({
      provider,
      model,
      config: {
        baseURL:
          provider === "lmstudio"
            ? process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1"
            : provider === "ollama"
              ? process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1"
              : undefined,
      },
    });

    const result = await streamText({
      model: aiModel,
      messages: formattedMessages,
      temperature,
      maxOutputTokens: maxTokens,
    });

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
