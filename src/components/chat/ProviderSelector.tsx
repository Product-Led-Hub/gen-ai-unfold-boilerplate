"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AIProvider,
  AVAILABLE_MODELS,
  PROVIDER_INFO,
} from "@/lib/ai/providers";

interface ProviderSelectorProps {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

export function ProviderSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: ProviderSelectorProps) {
  const providers: AIProvider[] = [
    "openai",
    "anthropic",
    "google",
    "lmstudio",
    "ollama",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">AI Provider</CardTitle>
        <CardDescription className="text-xs">
          Select your preferred AI provider and model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {providers.map((p) => (
            <Button
              key={p}
              variant={provider === p ? "default" : "outline"}
              size="sm"
              onClick={() => onProviderChange(p)}
            >
              {PROVIDER_INFO[p].displayName}
              {PROVIDER_INFO[p].isLocal && (
                <span className="ml-1 text-xs opacity-70">(Local)</span>
              )}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          {provider === "lmstudio" || provider === "ollama" ? (
            <Input
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              placeholder="Enter model name"
            />
          ) : (
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {AVAILABLE_MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
