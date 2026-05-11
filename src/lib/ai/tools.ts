import { tool } from "ai";
import { z } from "zod";

// ─── Weather Tool ─────────────────────────────────────────────────────────────
// Demo: shows how to call an external API from a tool.
// In production, replace the mock with a real weather API (e.g. open-meteo.com).

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

// ─── DateTime Tool ────────────────────────────────────────────────────────────

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

// ─── All Tools Export ─────────────────────────────────────────────────────────

export const allTools = {
  weather: weatherTool,
  calculator: calculatorTool,
  dateTime: dateTimeTool,
} as const;

export type ToolName = keyof typeof allTools;
