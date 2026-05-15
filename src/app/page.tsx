"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FeaturesToggle,
} from "@/components/chat";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SessionsSidebar, type Session } from "@/components/chat/SessionsSidebar";
import { DocumentUpload } from "@/components/rag/DocumentUpload";
import { AIProvider } from "@/lib/ai/providers";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  setProvider,
  setModel,
  setTemperature,
  setMaxTokens,
  setSystemPrompt,
  setUseTools,
  setUseRAG,
  setRAGEmbeddingProvider,
} from "@/lib/store/slices/settingsSlice";

interface SavedMessage { id: string; role: string; content: string; }

export default function Home() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [historyLimit, setHistoryLimit] = useState(20);

  // Active session state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SavedMessage[]>([]);
  const [titleUpdates, setTitleUpdates] = useState<Record<string, string>>({});

  const loadSession = useCallback(async (session: Session) => {
    const res = await fetch(`/api/sessions/${session.id}/messages`);
    const msgs = (await res.json()) as SavedMessage[];
    setSessionMessages(msgs);
    setActiveSession(session);
  }, []);

  const handleSelectSession = (session: Session) => loadSession(session);

  const handleNewSession = (session: Session) => {
    setSessionMessages([]);
    setActiveSession(session);
  };

  const handleTitleUpdate = useCallback((title: string) => {
    if (!activeSession) return;
    setTitleUpdates((prev) => ({ ...prev, [activeSession.id]: title }));
  }, [activeSession]);

  // LLM providers from DB
  interface LLMProviderRow {
    id: string;
    label: string;
    provider: string;
    model: string;
    base_url: string | null;
    api_key: string | null;
    is_default: number;
  }
  // Setting profiles from DB
  interface SettingProfileRow {
    id: string;
    name: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    history_limit: number;
    is_default: number;
  }

  const [llmProviders, setLlmProviders] = useState<LLMProviderRow[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [settingProfiles, setSettingProfiles] = useState<SettingProfileRow[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [newProfileName, setNewProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSaveProfile, setShowSaveProfile] = useState(false);

  function applyProfile(profile: SettingProfileRow) {
    dispatch(setSystemPrompt(profile.system_prompt));
    dispatch(setTemperature(profile.temperature));
    dispatch(setMaxTokens(profile.max_tokens));
    setHistoryLimit(profile.history_limit);
    setSelectedProfileId(profile.id);
  }

  async function reloadProfiles() {
    const rows: SettingProfileRow[] = await fetch("/api/setting-profiles").then((r) => r.json());
    setSettingProfiles(rows);
    return rows;
  }

  async function saveCurrentAsProfile() {
    if (!newProfileName.trim()) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/setting-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName.trim(),
          system_prompt: settings.systemPrompt,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          history_limit: historyLimit,
          is_default: false,
        }),
      });
      const created: SettingProfileRow = await res.json();
      const rows = await reloadProfiles();
      applyProfile(rows.find((r) => r.id === created.id) ?? created);
      setNewProfileName("");
      setShowSaveProfile(false);
    } finally {
      setSavingProfile(false);
    }
  }

  useEffect(() => {
    fetch("/api/llm-providers")
      .then((r) => r.json())
      .then((rows: LLMProviderRow[]) => {
        setLlmProviders(rows);
        const def = rows.find((r) => r.is_default === 1) ?? rows[0];
        if (def) {
          setSelectedProviderId(def.id);
          dispatch(setProvider(def.provider as AIProvider));
          dispatch(setModel(def.model));
        }
      })
      .catch(() => {});

    // Load setting profiles
    reloadProfiles().then((rows) => {
      const def = rows.find((r) => r.is_default === 1) ?? rows[0];
      if (def) applyProfile(def);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProviderRowChange = (id: string) => {
    const row = llmProviders.find((p) => p.id === id);
    if (!row) return;
    setSelectedProviderId(id);
    dispatch(setProvider(row.provider as AIProvider));
    dispatch(setModel(row.model));
  };

  return (
    <main className="flex h-screen">
      {/* Sessions sidebar */}
      <SessionsSidebar
        activeSessionId={activeSession?.id ?? null}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        titleUpdates={titleUpdates}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold">{settings.provider}</h2>
            <p className="text-sm text-muted-foreground">{settings.model}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {settings.useTools && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Tools ON
              </span>
            )}
            {settings.useRAG && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                RAG ON
              </span>
            )}
          </div>
        </header>

        {activeSession ? (
          <ChatPanel
            key={activeSession.id}
            sessionId={activeSession.id}
            initialMessages={sessionMessages}
            historyLimit={historyLimit}
            onTitleUpdate={handleTitleUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a session or click <strong className="mx-1">+ New Chat</strong> to start
          </div>
        )}
      </div>

      {/* AI Settings sidebar — right */}
      <aside className="w-72 border-l p-4 hidden md:flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">AI Chat</h1>
          <div className="flex items-center gap-2">
            <a href="/settings/profiles" className="text-xs text-muted-foreground hover:text-foreground transition-colors" title="Manage setting profiles">
              ☰ Profiles
            </a>
            <a href="/settings/providers" className="text-xs text-muted-foreground hover:text-foreground transition-colors" title="Manage LLM providers">
              ⚙ Providers
            </a>
          </div>
        </div>

        {/* Setting Profile selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Setting Profile</label>
            <button
              onClick={() => setShowSaveProfile((v) => !v)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSaveProfile ? "✕ Cancel" : "+ Save current"}
            </button>
          </div>
          <select
            value={selectedProfileId}
            onChange={(e) => {
              const row = settingProfiles.find((p) => p.id === e.target.value);
              if (row) applyProfile(row);
            }}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {settingProfiles.length === 0 && <option value="">No profiles</option>}
            {settingProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.is_default === 1 ? " ★" : ""}
              </option>
            ))}
          </select>
          {showSaveProfile && (
            <div className="flex gap-1 mt-1">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCurrentAsProfile()}
                placeholder="Profile name…"
                className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                autoFocus
              />
              <button
                onClick={saveCurrentAsProfile}
                disabled={savingProfile || !newProfileName.trim()}
                className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
              >
                {savingProfile ? "…" : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* LLM Provider — from DB table */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">LLM Provider</label>
          <select
            value={selectedProviderId}
            onChange={(e) => handleProviderRowChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {llmProviders.length === 0 && (
              <option value="">No providers configured</option>
            )}
            {llmProviders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {selectedProviderId && (() => {
            const row = llmProviders.find((p) => p.id === selectedProviderId);
            return row ? (
              <p className="text-[10px] text-muted-foreground font-mono">
                {row.provider} / {row.model}
              </p>
            ) : null;
          })()}
        </div>

        {/* AI Settings */}
        <div className="space-y-4 rounded-lg border p-3">
          <p className="text-sm font-medium">AI Settings</p>

          {/* System Instruction */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">System Instruction</label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => dispatch(setSystemPrompt(e.target.value))}
              placeholder="You are a helpful AI assistant."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs resize-none"
            />
            <p className="text-[10px] text-muted-foreground">Overrides the default system prompt for every message in this session.</p>
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Temperature</label>
              <span className="text-xs font-mono">{settings.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={settings.temperature}
              onChange={(e) => dispatch(setTemperature(parseFloat(e.target.value)))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Precise (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max output tokens */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Max Output Tokens</label>
            <select
              value={settings.maxTokens}
              onChange={(e) => dispatch(setMaxTokens(Number(e.target.value)))}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {[1024, 2048, 4096, 8000, 16000, 32000].map((v) => (
                <option key={v} value={v}>
                  {v.toLocaleString()} tokens
                </option>
              ))}
            </select>
          </div>

          {/* Message History */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Message History</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={200}
                value={historyLimit}
                onChange={(e) =>
                  setHistoryLimit(Math.max(0, Math.min(200, Number(e.target.value))))
                }
                className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-center"
              />
              <span className="text-xs text-muted-foreground">
                {historyLimit === 0 ? "no history" : `last ${historyLimit} msgs`}
              </span>
            </div>
          </div>
        </div>

        {/* Session 3: Features (tools + RAG) */}
        <FeaturesToggle
          useTools={settings.useTools}
          useRAG={settings.useRAG}
          ragEmbeddingProvider={settings.ragEmbeddingProvider}
          onToggleTools={(v) => dispatch(setUseTools(v))}
          onToggleRAG={(v) => dispatch(setUseRAG(v))}
          onChangeEmbeddingProvider={(v) => dispatch(setRAGEmbeddingProvider(v))}
        />

        {/* Session 3: Knowledge base upload */}
        <DocumentUpload
          embeddingProvider={settings.ragEmbeddingProvider}
        />
      </aside>
    </main>
  );
}
