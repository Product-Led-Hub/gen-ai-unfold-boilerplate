# Using Claude Code with Ollama Models for Development 🚀

A comprehensive guide on setting up the open-source Claude Code with Ollama and the best local models for development.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
  - [1. Install Ollama](#1-install-ollama)
  - [2. Pull a Coding Model](#2-pull-a-coding-model)
  - [3. Install Claude Code](#3-install-claude-code)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Launch Claude Code](#5-launch-claude-code)
- [Best Ollama Models for Development (2026)](#best-ollama-models-for-development-2026)
  - [Model Comparison Table](#model-comparison-table)
  - [Recommendations by Hardware](#recommendations-by-hardware)
- [Hardware Requirements](#hardware-requirements)
- [Cloud Alternative (No Hardware Needed)](#cloud-alternative-no-hardware-needed)
- [Programmatic Usage (Python SDK)](#programmatic-usage-python-sdk)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Overview

Ollama's support for the **Anthropic Messages API** enables running Claude Code entirely on local,
open-source models — eliminating the need for expensive Anthropic subscriptions.

This creates a middle ground: the **agent** remains Anthropic's, but the **model layer** can be
swapped out. By pairing Claude Code with locally run, open-weight models, you separate an
influential agent interface from a single model provider.

---

## Prerequisites

| Requirement       | Details                                      |
| ----------------- | -------------------------------------------- |
| **OS**            | macOS, Linux, or Windows (WSL recommended)   |
| **RAM**           | 16 GB minimum, 32 GB+ recommended            |
| **GPU (optional)**| NVIDIA RTX 3090/4090 or Apple M-series chip  |
| **Node.js**       | v18+ (for Claude Code CLI)                   |
| **Ollama**        | Latest version                               |

---

## Step-by-Step Setup Guide

### 1. Install Ollama

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS / Windows:**

Download the installer from [https://ollama.com](https://ollama.com) and follow the on-screen
instructions.

**Verify installation:**

```bash
ollama --version
```

---

### 2. Pull a Coding Model

Choose one of the recommended models and pull it:

```bash
# Recommended options (pick one):
ollama pull qwen2.5-coder:32b
ollama pull glm-4.7-flash
ollama pull qwen3-coder
ollama pull gpt-oss:20b
```

> **Tip:** See the [Model Comparison Table](#model-comparison-table) below for detailed guidance.

---

### 3. Install Claude Code

Install Claude Code on macOS / Linux:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

---

### 4. Configure Environment Variables

This is the **key step**. Add the following to your `~/.bashrc` or `~/.zshrc`:

```bash
export ANTHROPIC_BASE_URL="http://localhost:11434"
export ANTHROPIC_AUTH_TOKEN="ollama"
export ANTHROPIC_API_KEY=""
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

Then reload your shell:

```bash
source ~/.bashrc
# or
source ~/.zshrc
```

---

### 5. Launch Claude Code

You have two options:

**Option A — Specify the model directly:**

```bash
claude --model glm-4.7-flash:latest
```

**Option B — Use Ollama's launcher (auto-selects model):**

```bash
ollama launch claude
```

> **Note:** If you are using the latest Ollama, `ollama launch claude` will configure the
> environment variables for you automatically.

---

## Best Ollama Models for Development (2026)

### Model Comparison Table

| Model                  | Best For                        | Size    | Pull Command                       |
| ---------------------- | ------------------------------- | ------- | ---------------------------------- |
| **Qwen 2.5 Coder 32B**| Code generation & reasoning     | 32B     | `ollama pull qwen2.5-coder:32b`   |
| **GLM 4.7 Flash**     | Speed + large context (128k)    | ~9B     | `ollama pull glm-4.7-flash`       |
| **Qwen3 Coder**       | Agentic coding, large codebases | Various | `ollama pull qwen3-coder`         |
| **GPT-OSS 20B**       | Reasoning + agentic tasks       | 20B     | `ollama pull gpt-oss:20b`         |
| **DeepSeek Coder V2** | Coding tasks                    | 16B     | `ollama pull deepseek-coder-v2`   |
| **Codestral**          | Python & complex logic          | Heavy   | `ollama pull codestral`           |

### Recommendations by Hardware

| Hardware                                  | Recommended Model(s)                          |
| ----------------------------------------- | --------------------------------------------- |
| **32 GB+ RAM** (Apple Silicon / RTX 4090) | Qwen 2.5 Coder 32B, GLM 4.7 Flash            |
| **16 GB RAM**                             | Qwen 2.5 Coder 7B, GLM 4.7 Flash             |
| **No GPU / Cloud preferred**              | `glm-4.7:cloud` or `qwen3-coder:480b-cloud`  |

---

## Hardware Requirements

Because Claude Code sends a **massive system prompt (~16k tokens)** to define its behavior,
hardware is the primary bottleneck.

- **Recommended:** NVIDIA GPU with 16–24 GB VRAM (e.g., RTX 3090/4090) **or** Apple M-series
  Mac with 32 GB+ RAM.
- **Minimum:** 16 GB total RAM.
- **CPU-only:** You can run smaller models (like Qwen 7B) on your CPU, but expect "Planning Mode"
  to take several minutes per step.

---

## Cloud Alternative (No Hardware Needed)

You can use advanced, non-local models via the **Ollama Cloud LLM** service. Compute runs remotely
while you keep Claude Code's workflow locally.

```bash
# Pull cloud-hosted models
ollama pull qwen3-coder:480b-cloud
ollama pull kimi-k2.5:cloud
```

---

## Programmatic Usage (Python SDK)

Ollama is compatible with the **Anthropic Messages API**, making it possible to use tools like
Claude Code with open models programmatically.

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://localhost:11434",
    api_key="ollama",  # required but ignored
)

message = client.messages.create(
    model="qwen3-coder",
    messages=[
        {
            "role": "user",
            "content": "Write a function to check if a number is prime",
        }
    ],
)

print(message.content)
```

---

## Troubleshooting

| Problem              | Solution                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| **Connection refused** | Ensure Ollama is running: `ollama serve`                               |
| **Model not found**   | Check `ollama list` and use the exact model name (including tag)        |
| **Slow responses**    | Expected on CPU — consider a smaller model or cloud alternative         |
| **Verify local mode** | Disconnect from the internet and run a prompt. A response = fully local |

---

## References

- [Ollama Official Website](https://ollama.com)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Qwen 2.5 Coder on Ollama](https://ollama.com/library/qwen2.5-coder)
- [GLM 4.7 Flash on Ollama](https://ollama.com/library/glm-4.7-flash)

---

> **Disclaimer:** While this approach can't match the capabilities of Anthropic's flagship
> proprietary models, it offers a highly practical, zero-cost alternative that is more than
> sufficient for most day-to-day development tasks.

---

*Last updated: February 2026*
