# Next.js AI Boilerplate

A production-ready boilerplate for building AI applications with Next.js and the Vercel AI SDK.

**Created by [ProductLedHub](https://productledhub.com) for the community.**

---

## Gen AI Development Bootcamp | Gen AI Unfold Summit 2026

This is the **official boilerplate** for the [Gen AI Development Bootcamp](https://productledhub.com/gen-ai-unfold-summit/gen-ai-development-bootcamp/) by Gen AI Unfold 2026.

The bootcamp brings together engineers, technical product managers, and tech leaders from across Europe to focus on **building and deploying real-world generative AI applications**.

For full bootcamp details, schedule, and registration, visit:
**[https://productledhub.com/gen-ai-unfold-summit/gen-ai-development-bootcamp/](https://productledhub.com/gen-ai-unfold-summit/gen-ai-development-bootcamp/)**

---

## Features

- **Next.js 16** with App Router and Turbopack
- **Vercel AI SDK** for streaming AI responses
- **5 AI Providers** out of the box:
  - OpenAI
  - Anthropic
  - Google AI
  - LM Studio (local models)
  - Ollama (local models)
- **Dynamic Provider Switching** - change AI providers on the fly
- **Token Counting** - real-time token counting with cost estimation
- **Redux Toolkit** - state management for chat and settings
- **shadcn/ui** - beautiful, accessible UI components
- **Zod Validation** - type-safe API validation
- **TypeScript** - full type safety

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/productledhub/nextjs-ai-boilerplate.git
cd nextjs-ai-boilerplate
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_API_KEY=...

# Local Providers (optional)
LMSTUDIO_BASE_URL=http://localhost:1234/v1
OLLAMA_BASE_URL=http://localhost:11434/v1
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your AI chat application.

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts      # AI chat API endpoint
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Main chat page
│   └── globals.css            # Global styles
├── components/
│   ├── chat/
│   │   ├── ChatMessages.tsx   # Message display
│   │   ├── ChatInput.tsx      # Input with token counter
│   │   └── ProviderSelector.tsx # AI provider selector
│   └── ui/                    # shadcn/ui components
├── hooks/
│   └── useTokenCount.ts       # Token counting hooks
├── lib/
│   ├── ai/
│   │   ├── providers.ts       # Dynamic AI provider factory
│   │   ├── schemas.ts         # Zod validation schemas
│   │   └── index.ts
│   ├── store/
│   │   ├── index.ts           # Redux store configuration
│   │   ├── provider.tsx       # Redux provider component
│   │   └── slices/
│   │       ├── chatSlice.ts   # Chat state management
│   │       └── settingsSlice.ts # Settings state
│   ├── tokenizer/
│   │   └── index.ts           # Token counting utilities
│   └── utils.ts               # Utility functions
```

## Usage Guide

### Using the Dynamic AI Provider

```typescript
import { getModel, AIProvider } from "@/lib/ai/providers";

// Get a model instance
const model = getModel({
  provider: "openai",    // or "anthropic", "google", "lmstudio", "ollama"
  model: "gpt-5.2",
});

// Use with Vercel AI SDK
const result = await streamText({
  model,
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Token Counting

```typescript
import { countTokens, countMessageTokens, formatTokenCount } from "@/lib/tokenizer";

// Count tokens in text
const tokens = countTokens("Hello, how are you?", "gpt-4o");

// Count tokens in messages
const messageTokens = countMessageTokens(messages, "gpt-5.2");

// Format for display
const display = formatTokenCount(1500); // "1.5K"
```

### Using Redux Store

```typescript
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setProvider, setModel } from "@/lib/store/slices/settingsSlice";

// In your component
const dispatch = useAppDispatch();
const settings = useAppSelector((state) => state.settings);

// Change provider
dispatch(setProvider("anthropic"));
dispatch(setModel("claude-4-5-sonnet-latest"));
```

### Adding New shadcn/ui Components

```bash
pnpm dlx shadcn@latest add [component-name]
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Supported Models

### OpenAI

### Anthropic
### Google AI

### Local (LM Studio / Ollama)
- Any model you have installed locally

## Using Local Models

### LM Studio

1. Download [LM Studio](https://lmstudio.ai/)
2. Load a model
3. Start the local server (default: `http://localhost:1234`)
4. Select "LM Studio" in the provider selector

### Ollama

1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama (runs on `http://localhost:11434`)
4. Select "Ollama" in the provider selector

## Customization

### Adding a New Provider

1. Update `src/lib/ai/providers.ts`:

```typescript
export type AIProvider = "openai" | "anthropic" | "google" | "lmstudio" | "ollama" | "your-provider";

// Add to createDynamicProvider switch statement
case "your-provider":
  return createYourProvider({
    apiKey: config?.apiKey || process.env.YOUR_PROVIDER_API_KEY,
  });
```

2. Update `AVAILABLE_MODELS` and `PROVIDER_INFO`

### Customizing the Chat UI

The chat components are in `src/components/chat/`. Modify them to fit your design needs.

### Adding New Features

This boilerplate is designed to be extended. Common additions:

- Chat history persistence
- User authentication
- File uploads
- Function calling / Tools
- RAG (Retrieval Augmented Generation)

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this boilerplate for any project.

---

Made with love by [ProductLedHub](https://productledhub.com) for the developer community.

