# CommandOS

**Your squad. Your mission. Full control.**

CommandOS is a multi-agent orchestration operating system that coordinates specialized AI agents like a military squad. Instead of relying on a single AI to do everything, CommandOS organizes agents by role — research, writing, analysis, review, automation — and makes them work together to accomplish complex missions.

```
   ██████╗ ██████╗ ███╗   ███╗███╗   ███╗ █████╗ ███╗   ██╗██████╗
  ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔══██╗████╗  ██║██╔══██╗
  ██║     ██║   ██║██╔████╔██║██╔████╔██║███████║██╔██╗ ██║██║  ██║
  ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║  ██║
  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║██████╔╝
   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝

              ██████╗ ███████╗
             ██╔═══██╗██╔════╝
             ██║   ██║███████╗
             ██║   ██║╚════██║
             ╚██████╔╝███████║
              ╚═════╝ ╚══════╝
```

---

## What is CommandOS?

CommandOS transforms AI into **structure, command, and real execution**.

Each agent has a clear role within the operation. The central system — the **Comandante** — sets priorities, distributes tasks, tracks progress, and ensures every part of the mission is executed at the right time.

### Built from two battle-tested projects

| Origin | What it brings |
|--------|---------------|
| **OpenClaude** | Provider-agnostic CLI engine — works with Anthropic, OpenAI, Gemini, Ollama, DeepSeek, and 200+ models |
| **OpenSquad** | Multi-agent orchestration — squads, skills, pipelines, YAML agents, best-practices |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- An LLM provider API key (Anthropic, OpenAI, Gemini, or a local model)

### Install & Build

```bash
git clone https://github.com/vitoropereira/commandOS.git
cd commandOS
bun install
bun run build
```

### Configure your provider

```bash
# Anthropic (default)
export ANTHROPIC_API_KEY="sk-ant-..."

# Or OpenAI
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY="sk-..."

# Or Gemini
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY="..."

# Or Ollama (local, free)
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_API_KEY="ollama"
```

### Launch

```bash
./bin/commandos
```

---

## The Comandante

The Comandante is the central orchestrator. Access it via slash commands inside the CLI:

| Command | What it does |
|---------|-------------|
| `/comandante` | Main menu |
| `/comandante run <task>` | Send a task to be orchestrated across agents |
| `/comandante agents` | List all registered agents |
| `/comandante onboard` | Create a new agent interactively |
| `/comandante logs` | View execution history |
| `/comandante squads` | List available squads |
| `/comandante skills` | List installed skills |
| `/comandante status` | Show current configuration |

### Example mission

```
/comandante run "pesquise sobre multi-agent systems e escreva um resumo executivo"
```

The Comandante will:
1. Analyze the task
2. Route to **Pesquisador** (research agent) to gather information
3. Pass results to **Redator** (writing agent) to produce the executive summary
4. Consolidate and present the final output

---

## Agents

CommandOS ships with three agents ready to go:

| Agent | Model | Role |
|-------|-------|------|
| **Pesquisador** | claude-haiku-4-5 | Research & information synthesis. Returns bullet points with sources. |
| **Redator** | claude-sonnet-4-6 | Transforms research into clear, well-structured text. Adapts tone to context. |
| **Analista** | claude-sonnet-4-6 | Data analysis, pattern detection, insights. Uses SAR framework (Situation > Analysis > Recommendation). |

### Create your own agent

```
/comandante onboard
```

Or manually create files in `_commandos/agents/{id}/`:

```yaml
# agent.yaml
name: "My Agent"
id: "my-agent"
description: "What this agent does"
provider: anthropic
model: claude-sonnet-4-6
skills: []
status: active
behavior: "How it should behave"
```

---

## Skills

Skills extend agent capabilities. They live in `_commandos/skills/` as directories with a `SKILL.md` file.

**Four types:**

| Type | Icon | Description |
|------|------|-------------|
| `mcp` | :electric_plug: | MCP server integration |
| `script` | :scroll: | Custom scripts (Node, Python, Bash) |
| `hybrid` | :twisted_rightwards_arrows: | Both MCP and script |
| `prompt` | :bulb: | Behavioral instructions only |

**Pre-installed skills:** apify, blotato, canva, image-creator, image-fetcher, instagram-publisher, resend, template-designer, and more.

---

## Squads

Squads are pre-configured teams of agents with defined pipelines. CommandOS includes a complete example squad: **instagram-carrossel** — a 5-agent team that researches news, writes copy, designs visuals, reviews quality, and publishes to Instagram.

```
/comandante squads
```

---

## Architecture

```
commandOS/
├── src/                      # TypeScript engine
│   ├── comandante/           # Orchestration module (router, executor, onboard, memory)
│   ├── commands/comandante/  # /comandante slash command
│   ├── services/api/         # Provider shims (Anthropic, OpenAI, Gemini, Ollama...)
│   ├── tools/                # 50+ tools (Bash, Read, Edit, Grep, WebFetch...)
│   └── skills/loader.ts      # Unified skill loader
│
├── _commandos/               # File-based runtime data
│   ├── core/                 # Comandante agent, pipeline runner, prompts, best-practices
│   ├── agents/               # Registered agents (YAML + memory)
│   ├── skills/               # Installed skills (SKILL.md)
│   ├── squads/               # Squad configurations with pipelines
│   └── _memory/              # Config, run history, company context
│
├── bin/commandos             # CLI entry point
└── scripts/build.ts          # Bun bundler config
```

### Key design principles

- **File-based, no database** — Everything is YAML, JSON, and Markdown. Full portability.
- **Provider-agnostic** — Works with any LLM through provider shims.
- **Bun runtime** — Fast builds, modern JS runtime.
- **TypeScript strict** — Full type safety across the codebase.
- **Military metaphor** — Agents as specialists, Comandante as orchestrator, tasks as missions.

---

## Development

```bash
bun run build          # Bundle src/ into dist/cli.mjs
bun run dev            # Build + run locally
bun run smoke          # Build + version check
bun run typecheck      # TypeScript check
bun test               # Run tests
```

Provider shortcuts:
```bash
bun run dev:ollama     # Launch with Ollama
bun run dev:openai     # Launch with OpenAI
bun run dev:gemini     # Launch with Gemini
bun run profile:init   # Interactive profile setup
```

---

## Roadmap

- [ ] Web dashboard with authentication
- [ ] Telegram bot integration
- [ ] Multi-tenant support
- [ ] Cloud/VPS deployment
- [ ] Mobile app

---

## Origins

CommandOS is built on top of [OpenClaude](https://github.com/anthropics/claude-code) (provider-agnostic Claude Code) and [OpenSquad](https://github.com/renatoasse/opensquad) (multi-agent orchestration framework).

---

## License

MIT
