# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What is CommandOS

CommandOS is a multi-agent orchestration operating system that coordinates specialized AI agents like a military squad. It is the result of merging two projects:

- **OpenClaude** — Provider-agnostic CLI engine with tool system, agent routing, TUI (React+Ink), and Bun build
- **OpenSquad** — Multi-agent orchestration framework with squads, skills, pipelines, and YAML-defined agents

The result is a unified system where:
- `src/` contains the TypeScript engine (from OpenClaude)
- `_commandos/` contains the file-based runtime data (from OpenSquad)
- `src/comandante/` is the NEW orchestration module that bridges both

## Architecture

### Two-Layer Structure

1. **`src/` — TypeScript Engine** (from OpenClaude)
   - Provider shim system (Anthropic, OpenAI, Gemini, Ollama, etc.)
   - Tool system with 50+ tools
   - Slash command system
   - React+Ink TUI
   - Skill loading and discovery

2. **`_commandos/` — File-Based Runtime** (from OpenSquad)
   - Agent definitions in YAML
   - Skills with SKILL.md (YAML frontmatter + markdown)
   - Squad configurations and pipelines
   - Persistent memory (YAML, JSON, Markdown)
   - Best-practices guides and prompt templates

### Entrypoint Flow

```
bin/commandos → dist/cli.mjs → src/entrypoints/cli.tsx → src/entrypoints/init.ts → src/main.tsx
```

### Provider Shim System

All LLM calls go through the Anthropic SDK interface. Non-Anthropic providers are translated by shims:

- `src/services/api/openaiShim.ts` — OpenAI, Ollama, Groq, DeepSeek, etc.
- `src/services/api/codexShim.ts` — Codex models
- `src/services/api/providerConfig.ts` — Provider detection and config
- `src/services/api/agentRouting.ts` — Agent-specific provider routing
- `src/services/api/client.ts` — Central API client dispatch

### Comandante Module (`src/comandante/`)

The central orchestrator that coordinates agents:

- `router.ts` — Loads agents from `_commandos/agents/_index.yaml`, routes tasks to agents based on keyword matching and descriptions
- `executor.ts` — Executes agent routes sequentially (sync) or in parallel (async)
- `onboard.ts` — Creates new agents with proper file structure
- `memory.ts` — Reads/writes config, runs, and company context
- `index.ts` — Public exports

### Slash Command: `/comandante`

Registered in `src/commands/comandante/index.ts`. Subcommands:

| Command | Action |
|---|---|
| `/comandante` | Main menu with all options |
| `/comandante run <task>` | Route and execute a task across agents |
| `/comandante agents` | List registered agents with status |
| `/comandante onboard` | Interactive agent creation flow |
| `/comandante logs` | Show execution history |
| `/comandante squads` | List available squads |
| `/comandante skills` | List available skills |
| `/comandante status` | Show current configuration |

## Build & Dev Commands

```bash
bun install              # install dependencies
bun run build            # bundle src/ → dist/cli.mjs
bun run dev              # build + run locally
bun run smoke            # build + version check
bun run typecheck        # tsc --noEmit
bun test                 # run tests
bun run onboard          # create a new agent (direct CLI)
```

Provider shortcuts:
```bash
bun run dev:ollama       # launch with Ollama
bun run dev:openai       # launch with OpenAI
bun run dev:gemini       # launch with Gemini
bun run profile:init     # interactive profile bootstrap
```

## How to Create a New Agent

### Via CLI
```bash
/comandante onboard
```

### Manually
1. Create `_commandos/agents/{id}/agent.yaml`:
   ```yaml
   name: "Agent Name"
   id: "agent-id"
   description: "What this agent does"
   provider: anthropic
   model: claude-sonnet-4-6
   skills: []
   status: active
   behavior: "How it behaves"
   created: "2026-04-06"
   ```
2. Create `_commandos/agents/{id}/memory.md` with initial context
3. Add entry to `_commandos/agents/_index.yaml`

## How to Create a New Skill

1. Create `_commandos/skills/{name}/SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: "Skill Name"
   description: "What it does"
   type: mcp | script | hybrid | prompt
   version: "1.0.0"
   categories: [tag1, tag2]
   ---
   # Instructions
   Markdown body injected into agent context at runtime.
   ```
2. For MCP skills, configure the server in `.claude/settings.local.json`
3. Reference the skill in agent YAML: `skills: [skill-name]`

## How to Create a New Squad

Squads follow the OpenSquad format in `_commandos/squads/`:

1. Create `_commandos/squads/{code}/squad.yaml` with name, agents, pipeline config
2. Create agent files in `squads/{code}/agents/`
3. Create pipeline in `squads/{code}/pipeline/pipeline.yaml` with step definitions
4. Create step files in `squads/{code}/pipeline/steps/`

## Key Directories

| Directory | Purpose |
|---|---|
| `src/services/api/` | Provider shims, API client, routing |
| `src/services/mcp/` | MCP server/client integration |
| `src/tools/` | Tool implementations (one dir per tool) |
| `src/commands/` | Slash commands |
| `src/comandante/` | Orchestration engine |
| `src/skills/` | Skill loading system |
| `_commandos/core/` | Comandante agent, pipeline runner, prompts, best-practices |
| `_commandos/agents/` | Registered agent definitions |
| `_commandos/skills/` | Installed skills (SKILL.md) |
| `_commandos/squads/` | Squad configurations |
| `_commandos/_memory/` | Persistent memory, config, run history |
| `scripts/` | Build and maintenance scripts |

## Design Decisions

- **File-based persistence** — All state in YAML, JSON, Markdown. No database.
- **Provider-agnostic** — Works with any LLM via provider shims.
- **Bun as runtime** — Build and runtime use Bun.
- **TypeScript strict** — Full strict mode as defined in tsconfig.json.
- **No web server** — CLI-only for now.
- **Military metaphor** — Agents as specialists, Comandante as orchestrator, tasks as missions.

## [FUTURO] Roadmap

- Web dashboard with authentication and per-user data
- Telegram bot integration for agent conversation
- Multi-tenant access
- Cloud/VPS deployment
- Mobile app
