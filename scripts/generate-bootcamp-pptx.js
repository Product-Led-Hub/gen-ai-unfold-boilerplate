/**
 * Gen AI Development Bootcamp — Session 1 Detailed Slides (14 slides)
 * Run: NODE_PATH=/opt/homebrew/lib/node_modules node scripts/generate-bootcamp-pptx.js
 */

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ProductLedHub";
pres.title = "Gen AI Development Bootcamp — Session 1";

const C = {
  bg:"0F172A", card:"1E293B", card2:"162032",
  teal:"14B8A6", sky:"38BDF8", white:"F8FAFC",
  gray:"94A3B8", orange:"FB923C", purple:"A78BFA",
  green:"34D399", border:"334155", dark:"0D1117", code:"161B22",
  red:"F87171", yellow:"FCD34D", indigo:"818CF8",
};

const makeShadow = () => ({ type:"outer", blur:10, offset:3, angle:135, color:"000000", opacity:0.22 });

function bg(s) { s.background = { color:C.bg }; }

function sectionTag(s, text, color) {
  const c = color || C.teal;
  s.addShape(pres.shapes.RECTANGLE, { x:0.38,y:0.22,w:0.06,h:0.42, fill:{color:c}, line:{color:c} });
  s.addText(text, { x:0.55,y:0.23,w:5,h:0.35, fontSize:9, color:c, bold:true, charSpacing:3, fontFace:"Calibri" });
}

function pageTitle(s, text) {
  s.addText(text, { x:0.38,y:0.55,w:9.2,h:0.72, fontSize:34, color:C.white, bold:true, fontFace:"Calibri" });
}

function sessionBadge(s, num, color) {
  const c = color || C.teal;
  s.addShape(pres.shapes.RECTANGLE, { x:0.38,y:0.22,w:0.9,h:0.32, fill:{color:c}, line:{color:c} });
  s.addText("SESSION "+num, { x:0.38,y:0.22,w:0.9,h:0.32, fontSize:7.5, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });
}

function codeBlock(s, x, y, w, h, filename, codeText) {
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h, fill:{color:C.dark}, line:{color:"30363D"}, shadow:makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h:0.36, fill:{color:C.code}, line:{color:"30363D"} });
  [["FF5F57",0.18],["FFBD2E",0.38],["28C840",0.58]].forEach(([col,dx]) => {
    s.addShape(pres.shapes.OVAL, { x:x+dx,y:y+0.11,w:0.12,h:0.12, fill:{color:col}, line:{color:col} });
  });
  s.addText(filename, { x:x+0.8,y:y+0.07,w:w-1.0,h:0.22, fontSize:9, color:"8B949E", fontFace:"Consolas" });
  s.addText(codeText, { x:x+0.18,y:y+0.44,w:w-0.26,h:h-0.54, fontSize:9.5, color:C.green, fontFace:"Consolas", valign:"top", margin:0 });
}

function card(s, x, y, w, h, accent) {
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h, fill:{color:C.card}, line:{color:C.border}, shadow:makeShadow() });
  if (accent) s.addShape(pres.shapes.RECTANGLE, { x,y,w,h:0.06, fill:{color:accent}, line:{color:accent} });
}

function bullet(s, x, y, w, text, color) {
  const c = color || C.teal;
  s.addShape(pres.shapes.OVAL, { x,y:y+0.1,w:0.12,h:0.12, fill:{color:c}, line:{color:c} });
  s.addText(text, { x:x+0.22,y,w:w-0.22,h:0.3, fontSize:11, color:C.white, fontFace:"Calibri", margin:0 });
}

function flowBox(s, x, y, w, h, label, sub, color) {
  s.addShape(pres.shapes.RECTANGLE, { x,y,w,h, fill:{color:color}, line:{color:color}, shadow:makeShadow() });
  s.addText(label, { x,y:y+0.05,w,h:h*0.52, fontSize:10, color:"0F172A", bold:true, align:"center", valign:"bottom", fontFace:"Calibri", margin:0 });
  s.addText(sub,   { x,y:y+h*0.52,w,h:h*0.44, fontSize:8.5, color:"0F172A", align:"center", valign:"top", fontFace:"Consolas", margin:0 });
}

function connector(s, x, y, w) {
  s.addShape(pres.shapes.RECTANGLE, { x,y:y+0.04,w,h:0.07, fill:{color:C.border}, line:{color:C.border} });
}

// ══════════════════════════════════════════════════════════════════════
// SLIDE 1 — MAIN TITLE
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.28,h:5.625, fill:{color:C.teal}, line:{color:C.teal} });
  s.addShape(pres.shapes.RECTANGLE, { x:7.7,y:0,w:2.3,h:5.625, fill:{color:C.card}, line:{color:C.card} });
  for (let r=0;r<6;r++) for (let c=0;c<4;c++)
    s.addShape(pres.shapes.OVAL, { x:8.0+c*0.45,y:0.35+r*0.85,w:0.07,h:0.07, fill:{color:"334155"}, line:{color:"334155"} });

  s.addShape(pres.shapes.RECTANGLE, { x:0.45,y:0.36,w:3.0,h:0.3, fill:{color:"0D9488"}, line:{color:"0D9488"} });
  s.addText("GEN AI UNFOLD SUMMIT 2026", { x:0.45,y:0.36,w:3.0,h:0.3, fontSize:7.5, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });

  s.addText("Gen AI Development", { x:0.45,y:0.9,w:7.0,h:0.95, fontSize:50, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Bootcamp", { x:0.45,y:1.78,w:7.0,h:0.95, fontSize:50, color:C.teal, bold:true, fontFace:"Calibri" });
  s.addText("5 sessions  ·  50+ detailed slides  ·  Production-ready codebase  ·  100% TypeScript", { x:0.45,y:2.9,w:7.0,h:0.38, fontSize:13.5, color:C.gray, fontFace:"Calibri" });
  s.addText("Next.js 16  ·  Vercel AI SDK v6  ·  SQLite  ·  RAG  ·  Tool Calling  ·  TypeScript", { x:0.45,y:3.3,w:7.0,h:0.32, fontSize:11.5, color:"4B7AB5", fontFace:"Calibri" });

  [{n:"5",l:"Sessions"},{n:"5",l:"AI Providers"},{n:"15+",l:"Components"},{n:"100%",l:"TypeScript"}].forEach((st,i) => {
    const x=0.45+i*1.75;
    s.addShape(pres.shapes.RECTANGLE, { x,y:3.9,w:1.58,h:0.9, fill:{color:C.card}, line:{color:C.border}, shadow:makeShadow() });
    s.addText(st.n, { x,y:3.96,w:1.58,h:0.46, fontSize:24, color:C.sky, bold:true, align:"center", fontFace:"Calibri", margin:0 });
    s.addText(st.l, { x,y:4.42,w:1.58,h:0.28, fontSize:10, color:C.gray, align:"center", fontFace:"Calibri", margin:0 });
  });
  s.addText("productledhub.com", { x:0.45,y:5.22,w:4,h:0.25, fontSize:9, color:"475569" });
}

// ══════════════════════════════════════════════════════════════════════
// SLIDE 2 — BOOTCAMP OVERVIEW (all 5 sessions)
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sectionTag(s, "BOOTCAMP OVERVIEW");
  pageTitle(s, "5 Sessions  ·  One Complete AI App");

  const sessions = [
    {n:"1",title:"AI Foundations",     items:["Vercel AI SDK layers","5 AI providers","Streaming tokens","Zod validation","System prompts"],color:C.teal},
    {n:"2",title:"Chat UX & Settings", items:["Markdown rendering","Token counting","AI settings panel","Redux store","Temperature/MaxTokens"],color:C.sky},
    {n:"3",title:"Tool Calling & RAG", items:["Tool definition","weather/calc/datetime","RAG pipeline","Vector store","Top-K retrieval"],color:C.orange},
    {n:"4",title:"Persistence",        items:["SQLite sessions","Message history","Auto-migrations","Singleton pattern","Session sidebar"],color:C.purple},
    {n:"5",title:"LLM & Profiles",     items:["DB-driven providers","Setting profiles","CRUD API routes","Settings pages","Config-driven UI"],color:C.green},
  ];

  sessions.forEach((sess,i) => {
    const x=0.32+i*1.88;
    s.addShape(pres.shapes.RECTANGLE, { x,y:1.42,w:1.72,h:3.9, fill:{color:C.card}, line:{color:C.border}, shadow:makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x,y:1.42,w:1.72,h:0.06, fill:{color:sess.color}, line:{color:sess.color} });
    s.addShape(pres.shapes.OVAL, { x:x+0.56,y:1.58,w:0.6,h:0.6, fill:{color:sess.color}, line:{color:sess.color} });
    s.addText(sess.n, { x:x+0.56,y:1.58,w:0.6,h:0.6, fontSize:22, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });
    s.addText(sess.title, { x:x+0.08,y:2.38,w:1.56,h:0.38, fontSize:11, color:C.white, bold:true, fontFace:"Calibri", align:"center", margin:0 });
    sess.items.forEach((item,j) => {
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.1,y:2.88+j*0.48,w:1.52,h:0.38, fill:{color:C.card2}, line:{color:C.border} });
      s.addText(item, { x:x+0.1,y:2.88+j*0.48,w:1.52,h:0.38, fontSize:9.5, color:C.gray, align:"center", valign:"middle", fontFace:"Calibri", margin:0 });
    });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.32,y:5.25,w:9.36,h:0.28, fill:{color:C.card2}, line:{color:C.border} });
  s.addText("All sessions build on each other — you ship one cohesive production app, not five disconnected demos", { x:0.32,y:5.25,w:9.36,h:0.28, fontSize:10, color:C.gray, align:"center", valign:"middle", fontFace:"Calibri", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-1 — SESSION 1 COVER
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.28,h:5.625, fill:{color:C.teal}, line:{color:C.teal} });
  s.addShape(pres.shapes.RECTANGLE, { x:7.7,y:0,w:2.3,h:5.625, fill:{color:C.card}, line:{color:C.card} });

  s.addShape(pres.shapes.RECTANGLE, { x:0.45,y:0.36,w:1.12,h:0.32, fill:{color:C.teal}, line:{color:C.teal} });
  s.addText("SESSION 1", { x:0.45,y:0.36,w:1.12,h:0.32, fontSize:8.5, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });

  s.addText("AI Foundations", { x:0.45,y:0.9,w:6.9,h:1.05, fontSize:54, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Streaming  ·  Providers  ·  Validation  ·  Vercel AI SDK", { x:0.45,y:1.95,w:6.9,h:0.42, fontSize:17, color:C.teal, fontFace:"Calibri" });

  card(s, 0.45, 2.55, 3.1, 2.78, C.teal);
  s.addText("What You'll Learn", { x:0.65,y:2.69,w:2.72,h:0.32, fontSize:13, color:C.teal, bold:true, fontFace:"Calibri" });
  [
    "How Vercel AI SDK v6 layers fit together",
    "Setting up 5 AI providers (local + cloud)",
    "Streaming tokens via TextStreamChatTransport",
    "Validating every API request with Zod schemas",
    "Building POST /api/chat/route.ts from scratch",
    "System prompt design and override patterns",
  ].forEach((item,i) => bullet(s, 0.65, 3.08+i*0.36, 2.7, item, C.teal));

  card(s, 3.75, 2.55, 3.55, 2.78, C.sky);
  s.addText("Files You'll Create", { x:3.95,y:2.69,w:3.15,h:0.32, fontSize:13, color:C.sky, bold:true, fontFace:"Calibri" });
  [
    "src/app/api/chat/route.ts",
    "src/lib/ai/providers.ts",
    "src/lib/ai/schemas.ts",
    "src/lib/ai/index.ts",
    ".env.local  (API keys)",
  ].forEach((f,i) => {
    s.addShape(pres.shapes.RECTANGLE, { x:3.95,y:3.08+i*0.4,w:3.15,h:0.32, fill:{color:C.card2}, line:{color:C.border} });
    s.addText(f, { x:3.95,y:3.08+i*0.4,w:3.15,h:0.32, fontSize:10, color:C.sky, fontFace:"Consolas", align:"center", valign:"middle", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.45,y:5.22,w:9.1,h:0.28, fill:{color:C.card2}, line:{color:C.border} });
  s.addText("Duration: ~90 min  ·  Pre-req: Node 22+, pnpm, any code editor  ·  Difficulty: Beginner–Intermediate", { x:0.45,y:5.22,w:9.1,h:0.28, fontSize:9.5, color:C.gray, align:"center", valign:"middle", fontFace:"Calibri", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-2 — WHAT IS THE VERCEL AI SDK?
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("What is the Vercel AI SDK?", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("The unified toolkit for building AI-powered products in JavaScript & TypeScript — provider-agnostic, edge-compatible.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  // Three-layer architecture
  const layers = [
    {label:"@ai-sdk/react",    sub:"UI Layer",       desc:"useChat(), useCompletion(), useObject()\nHooks that manage streaming state in React.\nAbstracts away SSE, loading, error state.",  color:C.sky,    y:1.22},
    {label:"ai  (core)",       sub:"Core Layer",      desc:"streamText(), generateText(), streamObject()\nProvider-agnostic streaming primitives.\nconvertToModelMessages() lives here.",        color:C.teal,   y:2.38},
    {label:"Provider Adapters",sub:"Provider Layer",  desc:"openai(), anthropic(), google(), createOpenAI()\nThin wrappers normalising each LLM API.\nSame interface no matter the provider.",      color:C.purple, y:3.54},
  ];

  layers.forEach((l) => {
    card(s, 0.35, l.y, 5.8, 0.92, l.color);
    s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:l.y,w:1.55,h:0.92, fill:{color:l.color}, line:{color:l.color} });
    s.addText(l.sub,   { x:0.35,y:l.y,w:1.55,h:0.92, fontSize:11, color:"0F172A", bold:true, align:"center", valign:"middle", fontFace:"Calibri", margin:0 });
    s.addText(l.label, { x:2.06,y:l.y+0.1,w:3.9,h:0.3, fontSize:14, color:C.white, bold:true, fontFace:"Consolas", margin:0 });
    s.addText(l.desc,  { x:2.06,y:l.y+0.44,w:3.9,h:0.44, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });

  // Connectors between layers
  [1.22+0.92, 2.38+0.92].forEach((y) => {
    s.addShape(pres.shapes.RECTANGLE, { x:0.8,y,w:0.06,h:0.1, fill:{color:C.border}, line:{color:C.border} });
  });

  card(s, 6.35, 1.22, 3.25, 3.24, C.orange);
  s.addText("Why It Matters", { x:6.55,y:1.36,w:2.85,h:0.32, fontSize:14, color:C.orange, bold:true, fontFace:"Calibri" });
  [
    {h:"One API surface",    d:"Change provider by swapping one string. No code rewrite."},
    {h:"Built-in streaming", d:"SSE out of the box, no manual EventSource setup."},
    {h:"Full type safety",   d:"TypeScript generics from request body to response stream."},
    {h:"React hooks",        d:"useChat manages messages, status, input state for you."},
    {h:"v6 breaking changes",d:"UIMessage + TextStreamChatTransport replaced the old api string."},
  ].forEach((item,i) => {
    const y=1.78+i*0.52;
    s.addText(item.h, { x:6.55,y,w:2.85,h:0.24, fontSize:11, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(item.d, { x:6.55,y:y+0.24,w:2.85,h:0.24, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:4.6,w:9.25,h:0.32, fill:{color:"172233"}, line:{color:C.teal} });
  s.addText("v6 migration note: useChat now takes { transport, messages } — the old api: '/api/chat' string is gone.", { x:0.55,y:4.6,w:9.0,h:0.32, fontSize:10.5, color:C.teal, fontFace:"Consolas", valign:"middle", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-3 — AI PROVIDERS: THE LANDSCAPE
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("AI Providers — The Landscape", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("This boilerplate ships pre-configured for all five. Switch provider with a single Redux dispatch — no code change.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  const providers = [
    {name:"OpenAI",    type:"CLOUD", color:C.green,   models:"gpt-4o  /  gpt-4o-mini  /  gpt-3.5-turbo",          key:"OPENAI_API_KEY",               note:"Best general-purpose reasoning. Rate-limited on free tier. Most tool-call reliable."},
    {name:"Anthropic", type:"CLOUD", color:C.orange,  models:"claude-3-5-sonnet  /  claude-3-haiku",               key:"ANTHROPIC_API_KEY",            note:"Excellent for long context (200K tokens) and code tasks. No tool streaming yet."},
    {name:"Google AI", type:"CLOUD", color:C.sky,     models:"gemini-2.0-flash  /  gemini-1.5-pro",                key:"GOOGLE_GENERATIVE_AI_API_KEY", note:"Fastest cloud option. Great multimodal (image) support. Very cost-effective."},
    {name:"LM Studio", type:"LOCAL", color:C.teal,    models:"Any GGUF model: mistral-3b / llama3.2 / phi-3",      key:"base_url: http://localhost:1234/v1",  note:"100% free & private. No internet needed. Needs 8GB+ RAM for 7B models."},
    {name:"Ollama",    type:"LOCAL", color:C.purple,  models:"ollama pull llama3.2  /  mistral  /  codellama",     key:"base_url: http://localhost:11434/v1", note:"CLI-driven local inference. Easy model management. Cross-platform."},
  ];

  providers.forEach((p,i) => {
    const y=1.25+i*0.82;
    card(s, 0.35, y, 9.25, 0.74, p.color);
    s.addShape(pres.shapes.RECTANGLE, { x:0.35,y,w:1.12,h:0.74, fill:{color:p.color}, line:{color:p.color} });
    s.addText(p.name, { x:0.35,y,w:1.12,h:0.52, fontSize:13, color:"0F172A", bold:true, align:"center", valign:"bottom", fontFace:"Calibri", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:0.46,y:y+0.54,w:0.9,h:0.18, fill:{color:C.card2}, line:{color:C.border} });
    s.addText(p.type, { x:0.46,y:y+0.54,w:0.9,h:0.18, fontSize:7.5, color:p.color, bold:true, align:"center", valign:"middle", margin:0 });
    s.addText(p.models, { x:1.6,y:y+0.07,w:3.66,h:0.26, fontSize:10.5, color:C.white, bold:true, fontFace:"Consolas", margin:0 });
    s.addText(p.key,    { x:1.6,y:y+0.38,w:3.66,h:0.22, fontSize:9.5,  color:p.color, fontFace:"Consolas", margin:0 });
    s.addText(p.note,   { x:5.5,y:y+0.14,w:3.95,h:0.46, fontSize:10.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:5.27,w:9.25,h:0.25, fill:{color:C.card2}, line:{color:C.border} });
  s.addText("Local providers use the OpenAI-compatible API format — createOpenAI({ baseURL }) works for both LM Studio and Ollama.", { x:0.35,y:5.27,w:9.25,h:0.25, fontSize:9.5, color:C.teal, align:"center", valign:"middle", fontFace:"Calibri", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-4 — getModel() FACTORY
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("getModel() — The Provider Factory", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("One function hides all provider complexity. streamText() never needs to know which LLM it's talking to.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  codeBlock(s, 0.35, 1.12, 5.42, 4.2, "src/lib/ai/providers.ts",
    "import { openai }      from '@ai-sdk/openai';\n" +
    "import { anthropic }   from '@ai-sdk/anthropic';\n" +
    "import { google }      from '@ai-sdk/google';\n" +
    "import { createOpenAI } from '@ai-sdk/openai';\n\n" +
    "export function getModel({ provider, model }) {\n" +
    "  switch (provider) {\n" +
    "    case 'openai':\n" +
    "      return openai(model);\n\n" +
    "    case 'anthropic':\n" +
    "      return anthropic(model);\n\n" +
    "    case 'google':\n" +
    "      return google(model);\n\n" +
    "    case 'lmstudio': {\n" +
    "      const lm = createOpenAI({\n" +
    "        baseURL: process.env.LMSTUDIO_BASE_URL\n" +
    "              || 'http://localhost:1234/v1',\n" +
    "        apiKey:  'lm-studio',\n" +
    "      });\n" +
    "      return lm(model);\n" +
    "    }\n\n" +
    "    case 'ollama': {\n" +
    "      const ol = createOpenAI({\n" +
    "        baseURL: 'http://localhost:11434/v1',\n" +
    "        apiKey:  'ollama',\n" +
    "      });\n" +
    "      return ol(model);\n" +
    "    }\n\n" +
    "    default:\n" +
    "      throw new Error('Unknown: ' + provider);\n" +
    "  }\n" +
    "}"
  );

  card(s, 5.95, 1.12, 3.65, 4.2, C.sky);
  s.addText("Why a Factory?", { x:6.15,y:1.26,w:3.25,h:0.32, fontSize:14, color:C.sky, bold:true, fontFace:"Calibri" });
  [
    {h:"Single responsibility", d:"All provider logic is in one place. Change it once, affects everywhere."},
    {h:"streamText() is provider-agnostic", d:"It only sees a LanguageModel interface. Swap providers without touching route.ts."},
    {h:"API keys stay server-side", d:"process.env is only accessible in Node.js server code — never reaches the browser."},
    {h:"Local uses OpenAI compat layer", d:"LM Studio and Ollama both implement the OpenAI /v1/chat/completions spec."},
    {h:"Add a provider in 5 lines", d:"Install the adapter package, add a case to the switch — that's it."},
  ].forEach((item,i) => {
    const y=1.72+i*0.72;
    s.addShape(pres.shapes.RECTANGLE, { x:6.15,y,w:3.25,h:0.62, fill:{color:C.card2}, line:{color:C.border} });
    s.addText(item.h, { x:6.28,y:y+0.05,w:3.0,h:0.24, fontSize:10.5, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(item.d, { x:6.28,y:y+0.3, w:3.0,h:0.26, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });
}

// ══════════════════════════════════════════════════════════════════════
// S1-5 — MESSAGE TYPES DEEP DIVE
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("Message Types Deep Dive", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Three abstraction layers — understanding which type lives where prevents 80% of SDK type errors.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  const cols = [
    {
      title:"UIMessage",
      color:C.sky,
      pkg:"@ai-sdk/react",
      when:"ChatMessages.tsx — rendering",
      desc:"What useChat exposes to React. Has display\nfields like parts[], attachments[], createdAt.\nDo NOT construct manually — use the hook.",
      fields:["id: string (auto-generated)","role: user | assistant","content: string (for display)","parts: UIMessagePart[]","toolInvocations: ToolCall[]","createdAt: Date"],
    },
    {
      title:"ModelMessage",
      color:C.teal,
      pkg:"ai  (core)",
      when:"After convertToModelMessages()",
      desc:"Internal format for streamText(). Strips\nUI-only fields. Produced by calling\nconvertToModelMessages(uiMessages).",
      fields:["role: user | assistant | tool","content: string | ContentPart[]","— (no id)","— (no createdAt)","— (no attachments)","— (no parts array)"],
    },
    {
      title:"CoreMessage",
      color:C.purple,
      pkg:"ai  (core)",
      when:"Type annotations in route.ts",
      desc:"Alias / union type for ModelMessage in v6.\nUse specific subtypes for annotations:\nCoreUserMessage, CoreAssistantMessage.",
      fields:["CoreUserMessage","CoreAssistantMessage","CoreSystemMessage","CoreToolMessage","— same shape as ModelMessage","— use for type annotations"],
    },
  ];

  cols.forEach((col,i) => {
    const x=0.35+i*3.18;
    card(s, x, 1.22, 2.98, 4.1, col.color);
    s.addText(col.title, { x:x+0.15,y:1.34,w:2.68,h:0.36, fontSize:16, color:col.color, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(col.pkg,   { x:x+0.15,y:1.72,w:2.68,h:0.24, fontSize:9.5, color:C.gray, fontFace:"Consolas", margin:0 });
    s.addText(col.desc,  { x:x+0.15,y:2.0,  w:2.68,h:0.72, fontSize:9.5, color:C.white, fontFace:"Calibri", margin:0 });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.1,y:2.76,w:2.78,h:0.02, fill:{color:C.border}, line:{color:C.border} });
    s.addText("Fields:", { x:x+0.15,y:2.82,w:2.68,h:0.22, fontSize:9.5, color:C.gray, bold:true, fontFace:"Calibri", margin:0 });
    col.fields.forEach((f,j) => {
      const fc = f.startsWith("—") ? C.border : col.color;
      s.addText(f, { x:x+0.15,y:3.08+j*0.28,w:2.68,h:0.24, fontSize:9, color:fc, fontFace:"Consolas", margin:0 });
    });
    s.addShape(pres.shapes.RECTANGLE, { x:x+0.1,y:4.88,w:2.78,h:0.32, fill:{color:C.card2}, line:{color:col.color} });
    s.addText(col.when, { x:x+0.1,y:4.88,w:2.78,h:0.32, fontSize:9, color:col.color, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:5.28,w:9.25,h:0.26, fill:{color:"172233"}, line:{color:C.teal} });
  s.addText("Key call:  const coreMessages = convertToModelMessages(messages);  — do this before passing to streamText()", { x:0.52,y:5.28,w:9.0,h:0.26, fontSize:10.5, color:C.teal, fontFace:"Consolas", valign:"middle", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-6 — STREAMING ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("Streaming Architecture — Token Flow", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("How a single user message travels end-to-end and why each step exists.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  // Row 1: client → server
  const row1 = [
    {l:"User types  &  submits", s:"handleSubmit(e)",      c:C.sky},
    {l:"TextStreamChatTransport", s:"POST /api/chat",       c:C.sky},
    {l:"Zod validates body",      s:"chatRequestSchema",    c:C.orange},
    {l:"streamText() called",     s:"model + messages",     c:C.teal},
    {l:"SSE stream starts",       s:"createTextStreamResponse", c:C.green},
  ];
  row1.forEach((step,i) => {
    flowBox(s, 0.35+i*1.86, 1.22, 1.7, 0.85, step.l, step.s, step.c);
    if (i<4) connector(s, 0.35+i*1.86+1.7, 1.22+0.35, 0.16);
  });

  // Arrow down (right side)
  s.addShape(pres.shapes.RECTANGLE, { x:9.31,y:2.07,w:0.07,h:0.62, fill:{color:C.border}, line:{color:C.border} });

  // Row 2: server → client (reversed direction)
  const row2 = [
    {l:"Token renders in DOM",    s:"ChatMessages.tsx",     c:C.green},
    {l:"React state updates",     s:"messages[] re-renders", c:C.purple},
    {l:"useChat appends tokens",  s:"streaming word-by-word",c:C.teal},
    {l:"Transport reads SSE",     s:"EventSource stream",   c:C.sky},
    {l:"Response received",       s:"text/event-stream",    c:C.sky},
  ];
  row2.forEach((step,i) => {
    flowBox(s, 0.35+(4-i)*1.86, 2.69, 1.7, 0.85, step.l, step.s, step.c);
    if (i<4) connector(s, 0.35+(4-i)*1.86+1.7, 2.69+0.35, 0.16);
  });

  // Arrow left indicator at bottom-left
  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:3.07,w:0.07,h:0.62, fill:{color:C.border}, line:{color:C.border} });

  card(s, 0.35, 3.78, 9.25, 1.55, C.teal);
  s.addText("Key Insight", { x:0.55,y:3.92,w:2,h:0.28, fontSize:12, color:C.teal, bold:true, fontFace:"Calibri", margin:0 });
  s.addText(
    "TextStreamChatTransport is the bridge. It replaces the old api: '/api/chat' string from AI SDK v5. " +
    "It opens a persistent HTTP connection, reads Server-Sent Events (SSE), and pushes each token into the useChat messages array. " +
    "You configure it once in ChatPanel.tsx with useMemo — it rebuilds whenever settings change.",
    { x:0.55,y:4.24,w:8.85,h:0.52, fontSize:11, color:C.white, fontFace:"Calibri", margin:0 }
  );
  s.addText("const { messages, handleSubmit, status } = useChat({ transport, messages: initialMessages });", { x:0.55,y:4.8,w:8.85,h:0.3, fontSize:10, color:C.green, fontFace:"Consolas", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-7 — TextStreamChatTransport DEEP DIVE
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("TextStreamChatTransport Deep Dive", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("The bridge between your React hook and the streaming server route.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  codeBlock(s, 0.35, 1.12, 5.25, 2.78, "src/components/chat/ChatPanel.tsx",
    "// Transport rebuilds when any setting changes\n" +
    "const transport = useMemo(\n" +
    "  () => new TextStreamChatTransport({\n" +
    "    url: '/api/chat',\n" +
    "    body: {\n" +
    "      provider:     settings.provider,\n" +
    "      model:        settings.model,\n" +
    "      temperature:  settings.temperature,\n" +
    "      maxTokens:    settings.maxTokens,\n" +
    "      systemPrompt: settings.systemPrompt,\n" +
    "      useTools:     settings.useTools,\n" +
    "      useRAG:       settings.useRAG,\n" +
    "      sessionId:    currentSessionId,\n" +
    "    },\n" +
    "  }),\n" +
    "  [settings, currentSessionId]\n" +
    ");\n\n" +
    "const { messages, handleSubmit,\n" +
    "        input, setInput, status\n" +
    "} = useChat({ transport, messages: initial });"
  );

  card(s, 5.78, 1.12, 3.82, 2.78, C.sky);
  s.addText("Transport Config Options", { x:5.98,y:1.26,w:3.42,h:0.32, fontSize:13, color:C.sky, bold:true, fontFace:"Calibri" });
  [
    {k:"url",           v:"Server endpoint — '/api/chat'"},
    {k:"body",          v:"Extra fields merged with messages on every POST"},
    {k:"headers",       v:"Custom HTTP headers (auth tokens, tracing IDs)"},
    {k:"credentials",   v:"'include' for cross-origin cookie sessions"},
    {k:"streamProtocol",v:"'text' (default) — the server returns plain SSE"},
  ].forEach((opt,i) => {
    const y=1.68+i*0.42;
    s.addShape(pres.shapes.RECTANGLE, { x:5.98,y,w:1.28,h:0.32, fill:{color:C.sky}, line:{color:C.sky} });
    s.addText(opt.k, { x:5.98,y,w:1.28,h:0.32, fontSize:9.5, color:"0F172A", bold:true, fontFace:"Consolas", align:"center", valign:"middle", margin:0 });
    s.addText(opt.v, { x:7.36,y,w:2.14,h:0.32, fontSize:9.5, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  });

  codeBlock(s, 0.35, 4.08, 5.25, 1.12, "status values — critical to know",
    "// Valid in v6 — do NOT use 'loading'\n" +
    "'submitted' | 'streaming' | 'ready' | 'error'\n\n" +
    "const isLoading = status === 'submitted'\n" +
    "               || status === 'streaming';"
  );

  card(s, 5.78, 4.08, 3.82, 1.12, C.orange);
  s.addText("Common Mistakes", { x:5.98,y:4.22,w:3.42,h:0.28, fontSize:12, color:C.orange, bold:true, fontFace:"Calibri" });
  [
    "status === 'loading'  does NOT exist in v6",
    "Don't pass messages directly — use initialMessages",
    "useMemo deps must include ALL body fields",
  ].forEach((tip,i) => {
    s.addShape(pres.shapes.OVAL, { x:5.98,y:4.58+i*0.22+0.05,w:0.1,h:0.1, fill:{color:C.orange}, line:{color:C.orange} });
    s.addText(tip, { x:6.18,y:4.58+i*0.22,w:3.32,h:0.2, fontSize:9.5, color:C.white, fontFace:"Calibri", margin:0 });
  });
}

// ══════════════════════════════════════════════════════════════════════
// S1-8 — INPUT VALIDATION WITH ZOD
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("Input Validation with Zod", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Every untrusted input is validated at the API boundary before any AI call is made.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  codeBlock(s, 0.35, 1.12, 5.62, 3.92, "src/lib/ai/schemas.ts",
    "import { z } from 'zod';\n\n" +
    "export const chatRequestSchema = z.object({\n" +
    "  messages: z.array(z.object({\n" +
    "    id:      z.string(),\n" +
    "    role:    z.enum(['user','assistant','system']),\n" +
    "    content: z.string(),\n" +
    "  })),\n\n" +
    "  provider:    z.enum(['openai','anthropic',\n" +
    "                       'google','lmstudio','ollama']),\n\n" +
    "  model:       z.string().min(1).max(200),\n\n" +
    "  temperature: z.number().min(0).max(2)\n" +
    "                .optional().default(0.7),\n\n" +
    "  maxTokens:   z.number().int()\n" +
    "                .min(100).max(200000)\n" +
    "                .optional().default(8000),\n\n" +
    "  systemPrompt: z.string().max(10000).optional(),\n" +
    "  useTools:     z.boolean().optional().default(false),\n" +
    "  useRAG:       z.boolean().optional().default(false),\n" +
    "  sessionId:    z.string().optional(),\n" +
    "});\n\n" +
    "export type ChatRequest =\n" +
    "  z.infer<typeof chatRequestSchema>;"
  );

  card(s, 6.15, 1.12, 3.45, 3.92, C.orange);
  s.addText("Why Zod at the Boundary?", { x:6.35,y:1.26,w:3.05,h:0.32, fontSize:13, color:C.orange, bold:true, fontFace:"Calibri" });
  [
    {h:"Security",         d:"Provider enum blocks injection. A user can't swap to an arbitrary model endpoint."},
    {h:"Type safety",      d:"z.infer<> derives TypeScript types automatically. One schema = validation + types."},
    {h:"Defaults built-in",d:".default(0.7) ensures temperature is always set, even when the client omits it."},
    {h:"Early failure",    d:"400-class error before any AI API call saves quota, latency, and cost."},
    {h:"Self-documenting",  d:"The schema IS your API contract. New team members can read it in 60 seconds."},
  ].forEach((item,i) => {
    const y=1.68+i*0.68;
    s.addShape(pres.shapes.OVAL, { x:6.35,y:y+0.09,w:0.14,h:0.14, fill:{color:C.orange}, line:{color:C.orange} });
    s.addText(item.h, { x:6.6,y,w:2.8,h:0.24, fontSize:11, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(item.d, { x:6.6,y:y+0.26,w:2.8,h:0.3, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:5.12,w:9.25,h:0.3, fill:{color:"172233"}, line:{color:C.yellow} });
  s.addText("const body = chatRequestSchema.parse(await req.json());  // throws ZodError → automatic 400 response", { x:0.52,y:5.12,w:9.0,h:0.3, fontSize:10, color:C.yellow, fontFace:"Consolas", valign:"middle", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-9 — route.ts FULL WALKTHROUGH
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("POST /api/chat/route.ts — Full Walkthrough", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Every line explained. This is the heart of your AI application.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  codeBlock(s, 0.35, 1.12, 5.62, 4.32, "src/app/api/chat/route.ts",
    "export const runtime = 'nodejs'; // not 'edge'\n\n" +
    "export async function POST(req: Request) {\n" +
    "  // ① Parse & validate ──────────────────────\n" +
    "  const body   = await req.json();\n" +
    "  const valid  = chatRequestSchema.parse(body);\n\n" +
    "  // ② Build message chain ───────────────────\n" +
    "  const uiMsgs  = valid.messages as UIMessage[];\n" +
    "  const coreMsgs = convertToModelMessages(uiMsgs);\n\n" +
    "  // ③ System prompt (+ optional RAG) ────────\n" +
    "  let system = valid.systemPrompt\n" +
    "             || 'You are a helpful AI assistant.';\n" +
    "  if (valid.useRAG && valid.sessionId) {\n" +
    "    const ctx = await retrieveContext(lastMsg, 5);\n" +
    "    system = buildRAGSystemPrompt(system, ctx);\n" +
    "  }\n\n" +
    "  // ④ Resolve model ─────────────────────────\n" +
    "  const model = getModel({\n" +
    "    provider: valid.provider,\n" +
    "    model:    valid.model,\n" +
    "  });\n\n" +
    "  // ⑤ Stream & respond ──────────────────────\n" +
    "  const result = streamText({\n" +
    "    model, messages: coreMsgs, system,\n" +
    "    temperature: valid.temperature,\n" +
    "    maxTokens:   valid.maxTokens,\n" +
    "    tools: valid.useTools ? allTools : undefined,\n" +
    "  });\n" +
    "  return createTextStreamResponse(result);\n" +
    "}"
  );

  const anns = [
    {n:"①",title:"Zod parse()",           desc:"Throws ZodError on bad input (wrong provider, temp > 2). Auto 400 via Next.js error boundary.",           color:C.orange, y:1.12},
    {n:"②",title:"convertToModelMessages",desc:"Strips UIMessage display fields. Produces CoreMessage[] that streamText() actually consumes.",             color:C.sky,    y:2.0},
    {n:"③",title:"System prompt chain",   desc:"User override wins. If RAG is on, top-5 retrieved chunks are prepended before the user's instruction.",    color:C.purple, y:2.88},
    {n:"④",title:"getModel() factory",    desc:"Returns any LanguageModel. streamText() is completely decoupled from which provider is active.",            color:C.teal,   y:3.54},
    {n:"⑤",title:"createTextStreamResponse", desc:"Wraps the AsyncIterable returned by streamText(). Browser receives text/event-stream SSE tokens live.", color:C.green,  y:4.2},
  ];
  anns.forEach((ann) => {
    s.addShape(pres.shapes.RECTANGLE, { x:6.15,y:ann.y,w:3.45,h:0.62, fill:{color:C.card}, line:{color:ann.color}, shadow:makeShadow() });
    s.addShape(pres.shapes.OVAL, { x:6.15,y:ann.y+0.11,w:0.38,h:0.38, fill:{color:ann.color}, line:{color:ann.color} });
    s.addText(ann.n, { x:6.15,y:ann.y+0.11,w:0.38,h:0.38, fontSize:12, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });
    s.addText(ann.title, { x:6.64,y:ann.y+0.05,w:2.86,h:0.22, fontSize:10.5, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(ann.desc,  { x:6.64,y:ann.y+0.3, w:2.86,h:0.28, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });
}

// ══════════════════════════════════════════════════════════════════════
// S1-10 — SYSTEM PROMPTS
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("System Prompts — Design & Override", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("The most powerful lever over model behaviour. Gets injected on every single message.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  card(s, 0.35, 1.12, 4.5, 4.32, C.purple);
  s.addText("Anatomy of a Good System Prompt", { x:0.55,y:1.26,w:4.1,h:0.32, fontSize:13, color:C.purple, bold:true, fontFace:"Calibri" });
  [
    {h:"Role definition",          d:"'You are a senior TypeScript engineer' — persona, expertise, tone"},
    {h:"Output format",            d:"'Always respond in Markdown with fenced code blocks' — structure"},
    {h:"Domain constraints",       d:"'Focus only on the uploaded documents' — scope control"},
    {h:"Length guidance",          d:"'Be concise. Max 3 paragraphs unless explicitly asked for more'"},
    {h:"Context injection (RAG)",  d:"Top-K retrieved document chunks prepended automatically here"},
    {h:"Date / time awareness",    d:"Inject new Date().toISOString() so model knows today is not 2023"},
  ].forEach((item,i) => {
    const y=1.72+i*0.58;
    s.addShape(pres.shapes.RECTANGLE, { x:0.55,y,w:4.1,h:0.5, fill:{color:C.card2}, line:{color:C.border} });
    s.addShape(pres.shapes.RECTANGLE, { x:0.55,y,w:0.18,h:0.5, fill:{color:C.purple}, line:{color:C.purple} });
    s.addText(item.h, { x:0.84,y:y+0.04,w:3.71,h:0.2, fontSize:11, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(item.d, { x:0.84,y:y+0.26,w:3.71,h:0.2, fontSize:9.5, color:C.gray, fontFace:"Calibri", margin:0 });
  });

  codeBlock(s, 5.05, 1.12, 4.55, 2.18, "Override priority in route.ts",
    "// Priority: user setting > default\n" +
    "let system = body.systemPrompt\n" +
    "  || 'You are a helpful assistant.';\n\n" +
    "// RAG prepends context chunks\n" +
    "if (body.useRAG) {\n" +
    "  const chunks = await retrieveContext(\n" +
    "    lastUserMessage, 5\n" +
    "  );\n" +
    "  system = buildRAGSystemPrompt(\n" +
    "    system, chunks\n" +
    "  );\n" +
    "}"
  );

  card(s, 5.05, 3.46, 4.55, 1.98, C.orange);
  s.addText("Best Practices", { x:5.25,y:3.6,w:4.15,h:0.3, fontSize:13, color:C.orange, bold:true, fontFace:"Calibri" });
  [
    "Keep base prompt under 500 tokens — leave room for RAG context",
    "Store prompts in setting_profiles table — swap without code changes",
    "Test with and without custom prompt — ensure graceful fallback",
    "Never include user PII in system prompt — it is logged server-side",
    "Inject dynamic data (date, username) at request time in route.ts",
  ].forEach((tip,i) => {
    s.addShape(pres.shapes.OVAL, { x:5.25,y:4.02+i*0.32+0.1,w:0.12,h:0.12, fill:{color:C.orange}, line:{color:C.orange} });
    s.addText(tip, { x:5.48,y:4.02+i*0.32,w:3.92,h:0.28, fontSize:10, color:C.white, fontFace:"Calibri", margin:0 });
  });
}

// ══════════════════════════════════════════════════════════════════════
// S1-11 — ENVIRONMENT SETUP & API KEYS
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("Environment Setup & API Keys", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("Cloud providers need an API key in .env.local. Local providers need a running server process.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  codeBlock(s, 0.35, 1.12, 5.48, 3.28, ".env.local  (copy from .env.example)",
    "# ── Cloud Providers ─────────────────────────────\n" +
    "OPENAI_API_KEY=sk-proj-...\n" +
    "ANTHROPIC_API_KEY=sk-ant-...\n" +
    "GOOGLE_GENERATIVE_AI_API_KEY=AIza...\n\n" +
    "# ── Local Providers (no key needed) ─────────────\n" +
    "# LM Studio: File > Start Server (port 1234)\n" +
    "LMSTUDIO_BASE_URL=http://localhost:1234/v1\n\n" +
    "# Ollama: run  ollama serve  in a terminal\n" +
    "OLLAMA_BASE_URL=http://localhost:11434/v1\n\n" +
    "# ── Database (auto-created, no config) ───────────\n" +
    "# SQLite file created at ./chat.db on first run\n\n" +
    "# ── Optional debug ───────────────────────────────\n" +
    "NODE_ENV=development"
  );

  card(s, 6.05, 1.12, 3.55, 3.28, C.green);
  s.addText("Setup Checklist", { x:6.25,y:1.26,w:3.15,h:0.32, fontSize:14, color:C.green, bold:true, fontFace:"Calibri" });
  [
    {n:"1", step:"Clone & install",      cmd:"git clone ... && pnpm install"},
    {n:"2", step:"Create env file",      cmd:"cp .env.example .env.local"},
    {n:"3", step:"Add at least one key", cmd:"OPENAI_API_KEY=sk-proj-..."},
    {n:"4", step:"Start dev server",     cmd:"pnpm dev  →  localhost:3000"},
    {n:"5", step:"LM Studio (optional)", cmd:"Download app, load GGUF, Start Server"},
    {n:"6", step:"Ollama (optional)",    cmd:"ollama serve  &&  ollama pull llama3.2"},
  ].forEach((item,i) => {
    const y=1.72+i*0.44;
    s.addShape(pres.shapes.OVAL, { x:6.25,y:y+0.08,w:0.22,h:0.22, fill:{color:C.green}, line:{color:C.green} });
    s.addText(item.n, { x:6.25,y:y+0.08,w:0.22,h:0.22, fontSize:9, color:"0F172A", bold:true, align:"center", valign:"middle", margin:0 });
    s.addText(item.step, { x:6.58,y,w:2.82,h:0.22, fontSize:10.5, color:C.white, bold:true, fontFace:"Calibri", margin:0 });
    s.addText(item.cmd,  { x:6.58,y:y+0.22,w:2.82,h:0.2, fontSize:9, color:C.green, fontFace:"Consolas", margin:0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:4.52,w:9.25,h:0.62, fill:{color:"1A0F0F"}, line:{color:C.red} });
  s.addShape(pres.shapes.RECTANGLE, { x:0.35,y:4.52,w:0.18,h:0.62, fill:{color:C.red}, line:{color:C.red} });
  s.addText(
    "Security: .env.local is in .gitignore — never commit real keys.\n" +
    ".env.example (no real keys) IS committed as documentation for your team.",
    { x:0.64,y:4.56,w:8.86,h:0.54, fontSize:10.5, color:"FCA5A5", fontFace:"Calibri", margin:0 }
  );

  // LM Studio vs Ollama comparison
  card(s, 0.35, 5.22, 9.25, 0.3, null);
  s.addText("LM Studio = GUI app, good for demos  ·  Ollama = CLI, good for scripting  ·  Both use the same OpenAI-compat endpoint", { x:0.55,y:5.22,w:8.85,h:0.3, fontSize:10, color:C.gray, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
}

// ══════════════════════════════════════════════════════════════════════
// S1-12 — SESSION 1 RECAP
// ══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide(); bg(s);
  sessionBadge(s, 1, C.teal);
  s.addText("Session 1 — Recap & What's Next", { x:1.42,y:0.22,w:8.2,h:0.52, fontSize:30, color:C.white, bold:true, fontFace:"Calibri" });
  s.addText("You have a working streaming AI chat. Here is what you built and where we go next.", { x:0.38,y:0.82,w:9.2,h:0.3, fontSize:12, color:C.gray, fontFace:"Calibri" });

  card(s, 0.35, 1.22, 4.35, 4.1, C.teal);
  s.addText("What You Built in Session 1", { x:0.55,y:1.36,w:3.95,h:0.32, fontSize:14, color:C.teal, bold:true, fontFace:"Calibri" });
  [
    {f:"src/lib/ai/providers.ts",   d:"getModel() factory for all 5 providers"},
    {f:"src/lib/ai/schemas.ts",     d:"chatRequestSchema — Zod validation + types"},
    {f:"src/app/api/chat/route.ts", d:"POST handler with streaming SSE response"},
    {f:".env.local",                d:"API keys (cloud) + local server base URLs"},
    {f:"Working streaming chat",    d:"Tokens appear word-by-word in the browser"},
  ].forEach((item,i) => {
    const y=1.84+i*0.68;
    s.addShape(pres.shapes.RECTANGLE, { x:0.55,y,w:3.95,h:0.58, fill:{color:C.card2}, line:{color:C.border} });
    s.addShape(pres.shapes.RECTANGLE, { x:0.55,y,w:0.18,h:0.58, fill:{color:C.teal}, line:{color:C.teal} });
    s.addText(item.f, { x:0.84,y:y+0.04,w:3.56,h:0.24, fontSize:10.5, color:C.teal, bold:true, fontFace:"Consolas", margin:0 });
    s.addText(item.d, { x:0.84,y:y+0.3,  w:3.56,h:0.22, fontSize:10, color:C.white, fontFace:"Calibri", margin:0 });
  });

  card(s, 4.9, 1.22, 4.7, 2.02, C.orange);
  s.addText("Core Patterns Mastered", { x:5.1,y:1.36,w:4.3,h:0.32, fontSize:14, color:C.orange, bold:true, fontFace:"Calibri" });
  [
    "Provider abstraction via factory function",
    "SSE streaming with TextStreamChatTransport",
    "Zod schema = validation + types + defaults in one",
    "System prompt priority chain",
  ].forEach((p,i) => {
    s.addShape(pres.shapes.OVAL, { x:5.1,y:1.82+i*0.34+0.1,w:0.12,h:0.12, fill:{color:C.orange}, line:{color:C.orange} });
    s.addText(p, { x:5.32,y:1.82+i*0.34,w:4.1,h:0.3, fontSize:10.5, color:C.white, fontFace:"Calibri", margin:0 });
  });

  card(s, 4.9, 3.38, 4.7, 1.94, C.sky);
  s.addText("Coming Up: Session 2", { x:5.1,y:3.52,w:4.3,h:0.32, fontSize:14, color:C.sky, bold:true, fontFace:"Calibri" });
  s.addText("Chat UX & AI Settings", { x:5.1,y:3.9,w:4.3,h:0.34, fontSize:17, color:C.white, bold:true, fontFace:"Calibri" });
  [
    "Build ChatMessages.tsx with Markdown + syntax highlighting",
    "Add live token counter using js-tiktoken",
    "Wire up the AI Settings panel to Redux Toolkit",
    "Connect all settings to TextStreamChatTransport body",
  ].forEach((p,i) => {
    s.addShape(pres.shapes.OVAL, { x:5.1,y:4.34+i*0.26+0.08,w:0.1,h:0.1, fill:{color:C.sky}, line:{color:C.sky} });
    s.addText(p, { x:5.3,y:4.34+i*0.26,w:4.1,h:0.24, fontSize:10, color:C.white, fontFace:"Calibri", margin:0 });
  });
}

// ── Save ──────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "gen-ai-bootcamp-session1.pptx" })
  .then(() => console.log("\n  Saved: gen-ai-bootcamp-session1.pptx  (" + pres.slides.length + " slides)\n"))
  .catch((err) => { console.error("Error:", err); process.exit(1); });
