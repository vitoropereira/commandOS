# CommandOS — Diario de Bordo

> Registro cronologico de tudo que foi construido, decidido e aprendido durante o desenvolvimento do CommandOS.

---

## Dia 1 — 2026-04-06 | Nascimento do CommandOS

### A Ideia

O CommandOS nasceu de uma visao clara: em vez de depender de um unico agente de IA para fazer tudo, criar um **sistema operacional de orquestracao multiagente** — onde agentes especializados trabalham juntos como um esquadrao militar, cada um com seu papel definido.

A inspiracao veio do jogo **Commandos** — cada membro do time tem uma especialidade unica, e o sucesso da missao depende de coordenacao precisa entre eles.

### O Plano

Fundir dois projetos existentes em um so:

| Repo | O que traz |
|------|-----------|
| **OpenClaude** (`/Users/vop12/projects/openclaude`) | Engine CLI multi-provider, tool system (50+ tools), provider shims (OpenAI, Gemini, Ollama, etc.), TUI React+Ink, build com Bun |
| **OpenSquad** (`/Users/vop12/projects/opensquad`) | Orquestracao multiagente, squads YAML, skills com SKILL.md, pipelines sequenciais, prompts de agentes, best-practices |

Nenhum dos repos originais foi modificado — tudo foi lido e construido do zero no CommandOS.

### Fase 1 — Mapeamento

Antes de escrever uma unica linha de codigo, os dois repositorios foram mapeados integralmente:

- **OpenClaude**: 2041 arquivos em `src/`, sistema de provider shims, 50+ tools, 109+ slash commands, sistema de skills com 4 fontes (bundled, filesystem, plugin, MCP), entrypoint flow completo (`bin/openclaude` -> `cli.tsx` -> `init.ts` -> `main.tsx`)
- **OpenSquad**: Architect agent YAML, Pipeline Runner (execucao stateful com 6 etapas por step), Skills Engine (4 tipos: mcp/script/hybrid/prompt), sistema de squads com agents, pipelines e checkpoints, dashboard Phaser 2D, best-practices para 20+ formatos de conteudo

### Fase 2 — Estrutura Unificada

Criada a estrutura de duas camadas:

```
commandOS/
├── src/                    # TypeScript engine (base OpenClaude)
│   ├── comandante/         # NOVO — modulo de orquestracao
│   ├── commands/comandante/# NOVO — slash command /comandante
│   └── skills/loader.ts    # NOVO — loader unificado de skills
├── _commandos/             # Runtime file-based (base OpenSquad)
│   ├── core/               # Comandante agent, pipeline runner, prompts
│   ├── agents/             # Agentes registrados
│   ├── skills/             # Skills instaladas
│   ├── squads/             # Squads configurados
│   └── _memory/            # Persistencia (config, runs, company)
├── bin/commandos           # Entry point CLI
├── scripts/build.ts        # Build com Bun
└── CLAUDE.md               # Documentacao completa
```

### Fase 3 — Implementacao

**Arquivos criados do zero:**

- `package.json` — unificado com todas as dependencias dos dois repos, Bun como runtime, v1.0.0
- `tsconfig.json` — ES2022 strict, JSX react-jsx
- `bin/commandos` — entry point adaptado do OpenClaude
- `src/comandante/router.ts` — roteamento de tarefas para agentes por keyword matching e descricao
- `src/comandante/executor.ts` — execucao sync (sequencial) e async (paralela) de agentes
- `src/comandante/onboard.ts` — fluxo interativo de criacao de agentes
- `src/comandante/memory.ts` — leitura/escrita de config, runs e company context
- `src/comandante/index.ts` — exports publicos
- `src/skills/loader.ts` — descobre e parseia SKILL.md com YAML frontmatter
- `src/commands/comandante/index.ts` — slash command tipo `prompt` com 8 subcomandos

**Copiados e adaptados:**

- `src/` inteiro do OpenClaude (2041 arquivos)
- `_commandos/core/` — prompts, best-practices, pipeline runner, skills engine
- `_commandos/skills/` — 12 skills migradas (blotato, apify, canva, image-creator, etc.)
- `_commandos/squads/` — squad exemplo instagram-carrossel com pipeline completo de 13 steps
- `scripts/` — build scripts com branding atualizado

**Registros:**

- `/comandante` registrado em `src/commands.ts` no array COMMANDS
- Build script atualizado para mostrar "commandOS" em vez de "openclaude"

### Fase 4 — Agentes Iniciais

Tres agentes criados para validar o sistema:

| Agente | Modelo | Papel | Skills |
|--------|--------|-------|--------|
| Pesquisador | claude-haiku-4-5 | Busca e sintese de informacoes, retorna bullet points com fontes | web-search, summarizer |
| Redator | claude-sonnet-4-6 | Transforma pesquisas em texto claro, adapta tom ao contexto | nenhuma |
| Analista | claude-sonnet-4-6 | Identifica padroes, gera insights, framework SAR (Situacao -> Analise -> Recomendacao) | nenhuma |

Cada agente com:
- `_commandos/agents/{id}/agent.yaml` — definicao completa
- `_commandos/agents/{id}/memory.md` — memoria persistente
- Entrada em `_commandos/agents/_index.yaml`

### Fase 5 — Config e Memoria

- `_commandos/_memory/comandante-config.yaml` — modo sync, provider anthropic, max 3 agentes concorrentes, approval required
- `_commandos/_memory/comandante-runs.json` — historico de execucoes (vazio, pronto para uso)
- `_commandos/_memory/company.md` — template de contexto global

### Fase 6 — Build e Validacao

```bash
bun install    # 456 packages instalados em 3.84s
bun run build  # dist/cli.mjs gerado com sucesso
./bin/commandos --version  # 1.0.0
```

Build passou de primeira. Zero erros.

### Fase 7 — Branding

**Primeira versao:** Substituimos o banner "OPEN CLAUDE" por "COMMAND OS" com gradiente verde militar e tagline "Your squad. Your mission. Full control." — mas o ASCII art ficou ilegivel (letras muito apertadas).

**Segunda versao:** Redesenhamos com letras bloco mais espacadas e limpas. "COMMAND" na linha 1, "OS" na linha 2, cada letra bem definida. Gradiente verde/oliva militar mantido.

Paleta de cores:
- Gradiente: `[180,220,140]` -> `[50,85,40]` (verde claro para verde escuro)
- Accent: `[160,210,120]` (verde vibrante)
- Texto: `[200,215,185]` (creme esverdeado)
- Bordas: `[80,100,60]` (oliva escuro)

### Primeiro Push

Repositorio publicado em: **https://github.com/vitoropereira/commandOS**

- Commit inicial: `b9ae073` — 2197 arquivos, 559.503 linhas
- Commit branding: `b7e9a43` — tela de startup CommandOS
- Commit logo fix: `0fdb531` — letras redesenhadas para legibilidade

---

## Decisoes de Design

1. **File-based, sem banco de dados** — Tudo em YAML, JSON e Markdown. Portabilidade total.
2. **Provider-agnostic** — Funciona com qualquer LLM via provider shims.
3. **Bun como runtime** — Build rapido, runtime moderno.
4. **TypeScript strict** — Tipagem forte em todo o codigo.
5. **Metafora militar** — Agentes como especialistas, Comandante como orquestrador, tarefas como missoes.
6. **Dois repos, zero modificacoes** — OpenClaude e OpenSquad foram apenas lidos, nunca alterados.

---

## Dia 2 — 2026-04-07 | Documentacao e Identidade

### Logo v2

A primeira versao do banner ASCII ("COMMAND" + "OS" em block letters) ficou ilegivel no terminal — letras muito apertadas, impossivel de ler. Redesenhamos com letras mais espacadas e limpas usando caracteres Unicode padrao (`█ ╔ ═ ╗`). Resultado: legivel em qualquer largura de terminal.

### README.md

Criado o README completo do projeto cobrindo:
- Quick Start (clone, install, configure, launch)
- Todos os 8 subcomandos do Comandante com exemplos
- Tabela dos 3 agentes iniciais + como criar novos
- Sistema de skills (4 tipos: mcp, script, hybrid, prompt)
- Squads e o exemplo instagram-carrossel
- Diagrama de arquitetura (src/ + _commandos/)
- Comandos de desenvolvimento
- Roadmap futuro

### Diario de Bordo

Criado `docs/JORNADA.md` (este arquivo) como registro vivo de tudo que e construido, decidido e aprendido. Atualizado a cada sessao.

### Primeira tentativa de uso

Tentamos rodar `./bin/commandos` pela primeira vez. O banner renderiza perfeitamente (COMMAND OS em verde militar, provider info, tagline), mas **o input do teclado nao funciona** — o cursor aparece no prompt `>` mas nenhuma tecla e registrada.

Testamos em:
- Terminal integrado do VS Code — nao funciona
- Terminal.app nativo do macOS — nao funciona
- Modo non-interactive (`node dist/cli.mjs -p "diga oi"`) — **funciona perfeitamente**

Isso confirmou que a engine LLM esta ok. O problema e especificamente no stdin do modo interativo (TUI Ink/React).

### Investigacao do bug de input

Disparamos um agente de exploracao que mapeou o fluxo completo de input:

1. **earlyInput.ts** — captura keystrokes antes do REPL montar, depois transfere para o Ink
2. **App.tsx** — configura `process.stdin.setRawMode(true)` e registra listeners
3. **PromptInput.tsx** — decide `focus` baseado em 3 condicoes: `!isSearchingHistory && !isModalOverlayActive && !footerItemSelected`
4. **overlayContext.tsx** — qualquer overlay modal ativo bloqueia todo input

Adicionamos logs de debug em `App.tsx` (stdin setup) e `PromptInput.tsx` (focus decision). Resultado: **ZERO LOGS** — o que significa que o Ink app nunca chega a montar o REPL.

### Causa raiz identificada (parcial)

O problema esta em `showSetupScreens()` no arquivo `interactiveHelpers.tsx`. Antes de montar o REPL, o app passa por uma cadeia de dialogs:

1. **Onboarding dialog** — se nunca completou onboarding
2. **Trust dialog** — se nunca aceitou trust para o workspace
3. **ApproveApiKey dialog** — se tem ANTHROPIC_API_KEY nova

Esses dialogs renderizam via Ink mas podem estar falhando silenciosamente — o dialog aparece "invisivel" (sem output visual) mas bloqueia a Promise, impedindo que o REPL monte.

**Workaround identificado:** `./bin/commandos --bare` pula todos os dialogs, ou usar provider 3rd-party (OpenAI/Gemini) que pula os checks Anthropic.

### Status

Bug aberto. Proximos passos:
- Testar com `--bare` flag
- Testar com provider OpenAI (pula dialogs Anthropic)
- Se confirmar, desabilitar/adaptar os setup screens para o CommandOS

### Commits do dia

- `0fdb531` — fix: redesign startup logo for readability
- `6ee5a08` — docs: add JORNADA.md
- `acc9d2e` — docs: add README.md with full project documentation
- `3db8cda` — docs: update JORNADA.md with Day 2 entries

### Arquivos modificados (debug, nao commitados)

- `src/components/PromptInput/PromptInput.tsx` — log de debug no focus (temporario)
- `src/components/StartupScreen.ts` — log de debug removido pelo linter
- `src/ink/components/App.tsx` — log de debug no stdin setup (removido pelo linter)

---

## Roadmap (futuro)

- [ ] Web dashboard com autenticacao
- [ ] Integracao com Telegram (bot para conversar com agentes)
- [ ] Multi-tenant
- [ ] Deploy cloud/VPS
- [ ] Mobile app
