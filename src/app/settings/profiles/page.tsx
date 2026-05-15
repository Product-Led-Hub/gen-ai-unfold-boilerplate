"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingProfile {
  id: string;
  name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  history_limit: number;
  is_default: number;
}

const BLANK: Omit<SettingProfile, "id" | "is_default"> & { is_default: boolean } = {
  name: "",
  system_prompt: "You are a helpful AI assistant.",
  temperature: 0.7,
  max_tokens: 8000,
  history_limit: 20,
  is_default: false,
};

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<SettingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/setting-profiles");
      if (!res.ok) throw new Error("Failed to load profiles");
      setProfiles(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...BLANK });
    setOpen(true);
  }

  function openEdit(p: SettingProfile) {
    setEditId(p.id);
    setForm({
      name: p.name,
      system_prompt: p.system_prompt,
      temperature: p.temperature,
      max_tokens: p.max_tokens,
      history_limit: p.history_limit,
      is_default: p.is_default === 1,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const url = editId ? `/api/setting-profiles/${editId}` : "/api/setting-profiles";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
      setOpen(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this profile?")) return;
    await fetch(`/api/setting-profiles/${id}`, { method: "DELETE" });
    await load();
  }

  async function setDefault(id: string) {
    await fetch(`/api/setting-profiles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    await load();
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Chat
        </button>
        <h1 className="text-2xl font-bold flex-1">Setting Profiles</h1>
        <a
          href="/settings/providers"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
        >
          LLM Providers →
        </a>
        <Button onClick={openNew}>+ New Profile</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Temp</th>
                <th className="text-left px-4 py-3 font-medium">Max Tokens</th>
                <th className="text-left px-4 py-3 font-medium">History</th>
                <th className="text-left px-4 py-3 font-medium">System Prompt</th>
                <th className="text-left px-4 py-3 font-medium">Default</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No profiles yet. Click &ldquo;+ New Profile&rdquo; to create one.
                  </td>
                </tr>
              )}
              {profiles.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.temperature.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs">{p.max_tokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.history_limit === 0 ? "None" : `${p.history_limit} msgs`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">
                    {p.system_prompt}
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
                      <button onClick={() => openEdit(p)} className="text-xs text-muted-foreground hover:text-foreground">
                        Edit
                      </button>
                      <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:text-destructive/80">
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? "Edit Profile" : "New Profile"}
            </h2>

            <div className="space-y-3">
              <Field label="Profile Name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Creative Writer"
                />
              </Field>

              <Field label="System Instruction">
                <textarea
                  value={form.system_prompt}
                  onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="You are a helpful AI assistant."
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={`Temperature: ${form.temperature.toFixed(2)}`}>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={form.temperature}
                    onChange={(e) => setForm((f) => ({ ...f, temperature: parseFloat(e.target.value) }))}
                    className="w-full accent-primary mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Precise</span><span>Creative</span>
                  </div>
                </Field>

                <Field label="Max Output Tokens">
                  <select
                    value={form.max_tokens}
                    onChange={(e) => setForm((f) => ({ ...f, max_tokens: Number(e.target.value) }))}
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    {[1024, 2048, 4096, 8000, 16000, 32000].map((v) => (
                      <option key={v} value={v}>{v.toLocaleString()} tokens</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Message History Limit">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={form.history_limit}
                    onChange={(e) => setForm((f) => ({ ...f, history_limit: Math.max(0, Math.min(200, Number(e.target.value))) }))}
                    className="w-24 text-center"
                  />
                  <span className="text-xs text-muted-foreground">
                    {form.history_limit === 0 ? "no history" : `last ${form.history_limit} messages`}
                  </span>
                </div>
              </Field>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                />
                Set as default profile
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving || !form.name}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
