"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LLMProvider {
  id: string;
  label: string;
  provider: string;
  model: string;
  base_url: string | null;
  api_key: string | null;
  is_default: number;
}

const BLANK: Omit<LLMProvider, "id" | "created_at" | "updated_at" | "is_default"> & {
  is_default: boolean;
} = {
  label: "",
  provider: "lmstudio",
  model: "",
  base_url: "",
  api_key: "",
  is_default: false,
};

export default function ProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  async function loadProviders() {
    setLoading(true);
    try {
      const res = await fetch("/api/llm-providers");
      if (!res.ok) throw new Error("Failed to load providers");
      setProviders(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProviders();
  }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...BLANK });
    setOpen(true);
  }

  function openEdit(p: LLMProvider) {
    setEditId(p.id);
    setForm({
      label: p.label,
      provider: p.provider,
      model: p.model,
      base_url: p.base_url ?? "",
      api_key: p.api_key ?? "",
      is_default: p.is_default === 1,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        base_url: form.base_url || null,
        api_key: form.api_key || null,
      };
      const url = editId ? `/api/llm-providers/${editId}` : "/api/llm-providers";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadProviders();
      setOpen(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this provider?")) return;
    await fetch(`/api/llm-providers/${id}`, { method: "DELETE" });
    await loadProviders();
  }

  async function setDefault(id: string) {
    await fetch(`/api/llm-providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    await loadProviders();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Chat
        </button>
        <h1 className="text-2xl font-bold flex-1">LLM Providers</h1>
        <Button onClick={openNew}>+ Add Provider</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Label</th>
                <th className="text-left px-4 py-3 font-medium">Provider</th>
                <th className="text-left px-4 py-3 font-medium">Model</th>
                <th className="text-left px-4 py-3 font-medium">Base URL</th>
                <th className="text-left px-4 py-3 font-medium">Default</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No providers yet. Click &ldquo;+ Add Provider&rdquo; to create one.
                  </td>
                </tr>
              )}
              {providers.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.label}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                      {p.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.model}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[180px]">
                    {p.base_url ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_default === 1 ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        ✓ Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefault(p.id)}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Set default
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? "Edit Provider" : "New Provider"}
            </h2>

            <div className="space-y-3">
              <Field label="Label">
                <Input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="LM Studio – Mistral 3B"
                />
              </Field>

              <Field label="Provider">
                <select
                  value={form.provider}
                  onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="lmstudio">LM Studio</option>
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </select>
              </Field>

              <Field label="Model ID">
                <Input
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder="mistralai/ministral-3b-latest"
                />
              </Field>

              <Field label="Base URL (optional)">
                <Input
                  value={form.base_url ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  placeholder="http://localhost:1234/v1"
                />
              </Field>

              <Field label="API Key (optional)">
                <Input
                  type="password"
                  value={form.api_key ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
                  placeholder="sk-…"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                />
                Set as default provider
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !form.label || !form.model}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
