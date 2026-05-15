/**
 * @file lib/ai/tools.ts
 * @description Tool definitions for the AI agent (Vercel AI SDK tool calling).
 *
 * Each tool is an object with:
 *  - `description` — natural-language hint the LLM uses to decide when to call it.
 *  - `inputSchema` — Zod schema that validates and types the model's arguments.
 *  - `execute` — async function that runs server-side and returns the result.
 *
 * Current tools:
 *  - `weatherTool` — returns mock weather data for a city. Replace `execute()`
 *    with a real API (open-meteo.com, openweathermap) to go live.
 *  - `calculatorTool` — safe arithmetic evaluator (no `eval()`). Supports
 *    `+ - * / ** ()` and decimal numbers.
 *  - `currentDateTimeTool` — returns the current UTC date, time, and timezone.
 *  - `allTools` — record exported to `POST /api/chat` when `useTools: true`.
 *
 * How to add a new tool:
 * ```ts
 * export const myTool = tool({
 *   description: "What the tool does — be specific.",
 *   inputSchema: z.object({ arg: z.string() }),
 *   execute: async ({ arg }) => { return { result: arg.toUpperCase() }; },
 * });
 *
 * // Then add it to allTools:
 * export const allTools = { weather: weatherTool, calculator: calculatorTool, myTool };
 * ```
 *
 * Bootcamp session: Session 3 — Tool Calling.
 * Test prompt: "What is the weather in Athens?" with Tools ON in the sidebar.
 */
import { tool } from "ai";
import { z } from "zod";

// ─── Weather Tool ─────────────────────────────────────────────────────────────
// Session 3 live coding — first tool you add in the bootcamp.
// Currently uses mock data. Replace execute() with a real API call
// (e.g. open-meteo.com or openweathermap.org) for production.
// Test prompt: "What is the weather in Athens?" with Tools ON in LM Studio.

export const weatherTool = tool({
  description:
    "Get the current weather conditions for a given city. Use this when the user asks about weather.",
  inputSchema: z.object({
    city: z.string().describe("The city name to get weather for"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .optional()
      .default("celsius")
      .describe("Temperature unit"),
  }),
  execute: async ({ city, unit }: { city: string; unit: "celsius" | "fahrenheit" }) => {
    // Mock implementation — replace with real API in production
    const mockData: Record<string, { temperature: number; condition: string; humidity: number }> = {
      athens: { temperature: 28, condition: "Sunny", humidity: 45 },
      london: { temperature: 15, condition: "Cloudy", humidity: 78 },
      tokyo: { temperature: 22, condition: "Partly cloudy", humidity: 65 },
      "new york": { temperature: 18, condition: "Rainy", humidity: 82 },
    };

    const key = city.toLowerCase();
    const data = mockData[key] ?? { temperature: 20, condition: "Clear", humidity: 55 };

    const temperature =
      unit === "fahrenheit"
        ? Math.round(data.temperature * 9 / 5 + 32)
        : data.temperature;

    return {
      city,
      temperature,
      unit,
      condition: data.condition,
      humidity: data.humidity,
    };
  },
});

// ─── Calculator Tool ──────────────────────────────────────────────────────────
// Safe arithmetic evaluator — no eval() or Function() constructor.
// Supports: +, -, *, /, **, (, ), and decimal numbers.

function safeEval(expression: string): number {
  // Validate: only allow digits, operators, spaces, parentheses, dots
  if (!/^[\d\s+\-*/^().]+$/.test(expression)) {
    throw new Error("Invalid expression: only arithmetic operators allowed");
  }

  // Replace ^ with ** for exponentiation
  const sanitized = expression.replace(/\^/g, "**");

  // Recursive descent parser for safe evaluation
  const tokens = sanitized.match(/\d+\.?\d*|\*\*|[+\-*/()]|\s+/g) ?? [];
  const filtered = tokens.filter((t) => t.trim() !== "");

  let pos = 0;

  function parseExpr(): number {
    let left = parseTerm();
    while (pos < filtered.length && (filtered[pos] === "+" || filtered[pos] === "-")) {
      const op = filtered[pos++];
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (pos < filtered.length && (filtered[pos] === "*" || filtered[pos] === "/")) {
      const op = filtered[pos++];
      const right = parsePower();
      if (op === "/" && right === 0) throw new Error("Division by zero");
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parsePower(): number {
    const base = parseUnary();
    if (pos < filtered.length && filtered[pos] === "**") {
      pos++;
      const exp = parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (pos < filtered.length && filtered[pos] === "-") {
      pos++;
      return -parsePrimary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    if (pos < filtered.length && filtered[pos] === "(") {
      pos++;
      const val = parseExpr();
      if (filtered[pos] !== ")") throw new Error("Missing closing parenthesis");
      pos++;
      return val;
    }
    const token = filtered[pos];
    if (token === undefined || isNaN(Number(token))) {
      throw new Error(`Unexpected token: ${token}`);
    }
    pos++;
    return Number(token);
  }

  const result = parseExpr();
  if (pos !== filtered.length) throw new Error("Invalid expression");
  return result;
}

// STEP 1 — describe it clearly so the model knows WHEN to call this tool.
// STEP 2 — define inputSchema with Zod. The AI SDK converts it to JSON Schema
//          automatically and passes it to the model in the system context.
// STEP 3 — execute() is called by the SDK when the model triggers this tool.
//          Return plain data — the model reads it and writes the final answer.
// STEP 4 — add to allTools export at the bottom of this file.
export const calculatorTool = tool({
  description:
    "Perform safe arithmetic calculations. Supports +, -, *, /, ** (power), and parentheses.",
  inputSchema: z.object({
    expression: z
      .string()
      .describe(
        "The arithmetic expression to evaluate, e.g. '(15 * 8) / 3 + 2'"
      ),
  }),
  // No eval() or Function() — uses a recursive-descent parser for safety.
  execute: async ({ expression }: { expression: string }) => {
    try {
      const result = safeEval(expression);
      return { expression, result, success: true };
    } catch (err) {
      return {
        expression,
        result: null,
        success: false,
        error: err instanceof Error ? err.message : "Calculation failed",
      };
    }
  },
});

// ─── DateTime Tool ────────────────────────────────────────────────────────────// Example of a zero-input tool — inputSchema is an empty Zod object.
// Test prompt: "What day of the week is it today?"
export const dateTimeTool = tool({
  description: "Get the current date, time, and timezone information.",
  inputSchema: z.object({}),
  execute: async (_: Record<string, never>) => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      date: now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      unixTimestamp: Math.floor(now.getTime() / 1000),
    };
  },
});

// ─── All Tools Export ─────────────────────────────────────────────────────────// STEP 4 — register every tool here so route.ts can pass them to streamText.
// Add your own tool above, then include it in this object.
// The key name is what the model sees when deciding which tool to call.
export const allTools = {
  weather: weatherTool,
  calculator: calculatorTool,
  dateTime: dateTimeTool,
} as const;

export type ToolName = keyof typeof allTools;
