# CommandOS — Diario de Bordo

> Cada linha aqui conta uma historia real. Nao e documentacao tecnica — e o registro vivo de como o CommandOS foi pensado, construido, quebrado e consertado. Se voce esta lendo isso no futuro, vai entender nao so *o que* foi feito, mas *por que*, *como* e o que deu errado pelo caminho.

---

## Dia 1 — 2026-04-06 | O Nascimento

### Como tudo comecou

A ideia surgiu de uma frustracao simples: por que todo mundo usa IA como se fosse uma pessoa so fazendo tudo? No mundo real, times especializados resolvem problemas complexos. Um pesquisador pesquisa. Um redator escreve. Um analista analisa. Ninguem pede pro cirurgiao fazer a anestesia tambem.

Dai veio a pergunta: **e se a gente organizasse agentes de IA como um esquadrao militar?**

A inspiracao veio do jogo **Commandos** — aquele classico de estrategia onde cada membro do time tem uma habilidade unica (o Green Beret, o Sniper, o Sapper...) e o sucesso da missao depende de coordenar todos no momento certo. A imagem do jogo ficou ali na pasta como lembrete visual do que a gente queria construir.

O nome veio naturalmente: **CommandOS** — Command + OS. Um sistema operacional de comando.

### A materia-prima

Nao ia comecar do zero. Dois projetos ja existiam e tinham exatamente o que precisavamos:

**OpenClaude** — um fork do Claude Code que funciona com qualquer LLM. Tem toda a engine: CLI interativa com React+Ink no terminal, sistema de tools (50+), provider shims que traduzem chamadas Anthropic para OpenAI/Gemini/Ollama/etc, build com Bun. Um monstro de 2041 arquivos so em `src/`. O motor do carro.

**OpenSquad** — framework de orquestracao multiagente. Define agentes em YAML, organiza em squads, executa pipelines passo a passo com checkpoints humanos. Tem um acervo de best-practices para 20+ formatos de conteudo (Instagram, LinkedIn, YouTube, email...) e um sistema de skills extensivel. A inteligencia tatica.

O plano: pegar o motor do OpenClaude e instalar a inteligencia tatica do OpenSquad. Dois repos lidos, nenhum modificado. Tudo construido do zero no CommandOS.

### O mapeamento — ler antes de escrever

Antes de tocar em uma unica linha de codigo, lancamos dois agentes de exploracao em paralelo — um para cada repo. Cada um voltou com um relatorio exaustivo:

Do OpenClaude aprendemos como o provider shim funciona (toda chamada passa pelo formato Anthropic, nao importa se o destino e OpenAI ou Ollama), como os slash commands sao registrados (array COMMANDS em `commands.ts`, lazy-loaded), como o sistema de tools se estrutura (um diretorio por tool, cada um com schema Zod, permissoes, UI), e como o build do Bun empacota tudo num unico `dist/cli.mjs` com feature flags que eliminam codigo morto em compile time.

Do OpenSquad entendemos o modelo de orquestracao: o Architect projeta squads via fases (Discovery -> Investigation -> Design -> Build), o Pipeline Runner executa steps com validacao pre/pos e veto conditions, o Skills Engine gerencia integracao MCP/script/prompt, e tudo e persistido em arquivos — YAML, Markdown, JSON. Sem banco de dados, por decisao de design.

Esse mapeamento levou tempo, mas salvou a gente de tomar decisoes erradas depois. Quando voce conhece a base de codigo inteira antes de comecar, cada arquivo novo que cria ja nasce no lugar certo.

### A construcao — 7 fases em uma sessao

**Fase 1 — Esqueleto.** `package.json` unificando dependencias dos dois repos (456 packages), `tsconfig.json` com strict mode, `bin/commandos` como entry point, `.gitignore`, estrutura de diretorios criada com um unico `mkdir -p`.

**Fase 2 — O motor.** Copiamos os 2041 arquivos do `src/` do OpenClaude intactos. Essa e a base que faz o terminal funcionar, os providers responderem, as tools executarem. Nao reinventamos a roda — aproveitamos uma roda que ja tava rodando.

**Fase 3 — A inteligencia.** Migramos do OpenSquad: prompts de orquestracao, best-practices (24KB so o de copywriting), pipeline runner, skills engine, 12 skills instaladas (blotato pra social media, apify pra scraping, canva, image-creator...), e o squad de exemplo instagram-carrossel com 5 agentes e 13 steps de pipeline.

**Fase 4 — O Comandante.** Aqui veio o codigo novo de verdade. Cinco arquivos TypeScript em `src/comandante/`:

- `router.ts` — recebe uma tarefa em linguagem natural, carrega os agentes de `_commandos/agents/_index.yaml`, e decide quem vai executar o que. Usa keyword matching pra pontuar relevancia (nome do agente, descricao, skills). Se nenhum agente pontua, manda pra todos como fallback.

- `executor.ts` — pega as rotas do router e executa. Modo sync: um agente por vez, output do anterior vira input do proximo (encadeamento). Modo async: todos em paralelo com Promise.all. Persiste cada run em JSON.

- `onboard.ts` — cria novos agentes programaticamente: gera o `agent.yaml`, o `memory.md`, e atualiza o `_index.yaml`.

- `memory.ts` — leitura/escrita da config YAML, historico de runs JSON, e contexto da empresa em Markdown.

- `index.ts` — re-exporta tudo com tipos limpos.

**Fase 5 — O slash command.** `/comandante` com 8 subcomandos (run, agents, onboard, logs, squads, skills, status, e menu principal). Implementado como tipo `prompt` — o mais limpo pro nosso caso. Cada subcomando gera um prompt contextual que orienta o LLM sobre o que fazer. Registrado no array COMMANDS em `commands.ts`.

**Fase 6 — Os agentes.** Tres agentes iniciais pra validar o sistema:

O **Pesquisador** roda em claude-haiku-4-5 (rapido e barato pra pesquisa), sempre retorna bullet points com fontes. O **Redator** usa claude-sonnet-4-6, transforma dados em texto adaptando tom ao contexto. O **Analista** tambem em sonnet, segue o framework SAR: Situacao -> Analise -> Recomendacao. Cada um com seu YAML de definicao e Markdown de memoria persistente.

**Fase 7 — O branding.** Trocamos o banner "OPEN CLAUDE" por "COMMAND OS" com gradiente verde militar. A primeira versao ficou horrivel — letras bloco muito apertadas, ilegivel. Normal, ASCII art e tentativa e erro.

### O primeiro build

```
bun install    # 456 packages, 3.84s
bun run build  # dist/cli.mjs gerado
```

Passou de primeira. Sem erros. `node dist/cli.mjs --version` retornou `1.0.0`. Momento de satisfacao silenciosa.

### O push

Repositorio publicado em **https://github.com/vitoropereira/commandOS**. Commit inicial com 2197 arquivos e 559.503 linhas de codigo. Do zero ao GitHub em uma sessao.

Commits do dia:
- `b9ae073` — feat: initial CommandOS (o grande merge)
- `b7e9a43` — feat: rebrand startup screen
- `0fdb531` — fix: redesign startup logo for readability

---

## Dia 2 — 2026-04-07 | A Documentacao e o Primeiro Bug

### Polindo a identidade

Comecamos o dia olhando pro banner no terminal. A versao da noite anterior tava com as letras apertadas demais — "COMMAND" era uma sopa de pixels verdes. Redesenhamos com caracteres Unicode mais espacados (`█ ╔ ═ ╗`), cada letra bem separada. "COMMAND" na linha 1, "OS" na linha 2. Gradiente indo do verde claro `[180,220,140]` ao verde escuro `[50,85,40]`, passando por tons de oliva. A tagline: *"Your squad. Your mission. Full control."*

Rebuild, testou, ficou legivel. Proximo.

### O README

O projeto precisava de um README que explicasse o que e o CommandOS sem precisar ler o codigo. Criamos um completo: logo ASCII no topo, quick start em 4 passos (clone, install, configure provider, launch), tabela com todos os 8 subcomandos do `/comandante`, os 3 agentes iniciais, sistema de skills, como criar agentes novos, diagrama de arquitetura, comandos de dev. Tudo que alguem precisaria pra entender e comecar a usar.

### O diario

Neste ponto decidimos criar este arquivo — `docs/JORNADA.md`. A motivacao: projetos assim acumulam decisoes e contexto que se perdem entre sessoes. Um diario vivo resolve isso. Cada vez que trabalhamos no CommandOS, registramos o que aconteceu, por que, e o que aprendemos.

A primeira versao ficou superficial demais — parecia changelog tecnico, nao diario. O proprio usuario apontou: *"estamos colocando detalhes nesta jornada?"*. Tinha razao. Dai veio a decisao de reescrever com narrativa real, misturando tecnico com casual. O que voce esta lendo agora.

### A hora da verdade — tentando usar de verdade

Tudo construido, tudo commitado, hora de rodar:

```bash
./bin/commandos
```

O banner apareceu. Lindo. Verde militar, COMMAND OS em letras bloco, provider detectado (OpenAI/gpt-4o), endpoint, "Ready — type /help to begin", cursor piscando no prompt `>`.

E nada aconteceu.

Digitamos. Nada. Clicamos no terminal. Nada. As teclas simplesmente nao registravam. O cursor tava la, piscando bonito, mas surdo.

### A investigacao — descendo a toca do coelho

Primeira hipotese: problema do VS Code. O terminal integrado as vezes tem conflito com apps TUI que capturam stdin em raw mode. Tentamos no Terminal.app nativo do macOS. Mesmo resultado. Hipotese descartada.

Segunda hipotese: a engine ta quebrada. Testamos em modo non-interactive:

```bash
node dist/cli.mjs -p "diga oi"
```

Resposta: *"Oi! Hello! How can I help you with CommandOS today?"*

Engine perfeita. O LLM responde, o provider funciona, a CLI processa. O problema e **exclusivamente** no input interativo do TUI.

Terceira hipotese: algo no fluxo de captura de stdin. Lancamos um agente de exploracao pra mapear o caminho completo que uma tecla percorre do teclado ate aparecer na tela:

1. **earlyInput.ts** — captura keystrokes antes do REPL estar pronto (pra nao perder o que o usuario digita durante o startup). Configura `process.stdin.setRawMode(true)` e escuta eventos `readable`.

2. **App.tsx (Ink)** — quando o React monta, chama `stopCapturingEarlyInput()` pra parar a captura anterior, depois configura seus proprios listeners de stdin.

3. **PromptInput.tsx** — o componente de input decide se aceita teclas baseado em tres condicoes: `focus: !isSearchingHistory && !isModalOverlayActive && !footerItemSelected`. Se qualquer uma dessas for true, o input e bloqueado.

4. **overlayContext.tsx** — qualquer modal overlay ativo (dialog de permissao, onboarding, trust) bloqueia todo input do PromptInput.

### Os logs de debug que nao logaram nada

Adicionamos `console.error` em dois pontos criticos:
- No `App.tsx` onde stdin raw mode e ativado
- No `PromptInput.tsx` onde o focus e decidido

Rebuild, rodamos, mandamos stderr pra arquivo:

```bash
./bin/commandos 2>/tmp/commandos-debug.log
```

Resultado: arquivo vazio. **Zero logs.** Nenhum dos dois pontos foi alcancado.

Isso foi revelador. Significa que o Ink app monta (o banner aparece via `printStartupScreen()` que e um `stdout.write` direto), mas o React/REPL nunca renderiza. Algo trava **antes** do REPL existir.

### A causa raiz — os dialogs fantasma

Descemos mais um nivel e encontramos `showSetupScreens()` em `interactiveHelpers.tsx`. Antes de montar o REPL, o app passa por uma cadeia de dialogs obrigatorios:

1. **Onboarding** — na primeira execucao, mostra tela de boas-vindas
2. **Trust Dialog** — pede confirmacao de que o workspace e confiavel
3. **ApproveApiKey** — se detecta uma ANTHROPIC_API_KEY nova, pede aprovacao

Cada dialog e um componente React renderizado via Ink que retorna uma Promise. O REPL so monta depois que **todas** as Promises resolvem. Se qualquer dialog renderiza mas nao consegue capturar input (porque o proprio stdin nao esta configurado ainda, ou porque o dialog e "invisivel"), a Promise nunca resolve. O app trava. Silenciosamente. Sem erro. Sem log. So o cursor piscando.

E um deadlock elegante: os dialogs precisam de input pra continuar, mas o input so funciona depois que os dialogs terminam.

### O workaround

Identificamos que a flag `--bare` pula toda a cadeia de setup screens. E que providers 3rd-party (OpenAI, Gemini) pulam os dialogs especificos do Anthropic (trust, API key approval). Nao testamos ainda — ficou pro proximo dia.

### Status ao fim do dia

O CommandOS esta construido, compilado, publicado no GitHub, documentado com README e CLAUDE.md. A engine funciona (provado pelo modo `-p`). O bug de input interativo esta mapeado com causa raiz identificada mas nao corrigido.

### Commits do dia

- `0fdb531` — fix: redesign startup logo for readability
- `6ee5a08` — docs: add JORNADA.md
- `acc9d2e` — docs: add README.md with full project documentation
- `3db8cda` — docs: update JORNADA.md with Day 2 entries
- `5780310` — docs: update JORNADA.md — input bug investigation

### Proximos passos

- [ ] Testar `./bin/commandos --bare` (pula setup screens)
- [ ] Testar com provider OpenAI direto (pula dialogs Anthropic)
- [ ] Se confirmar causa, adaptar `showSetupScreens()` pro CommandOS — ou desabilitar os dialogs que nao se aplicam
- [ ] Primeira missao real: `/comandante run "pesquise sobre multi-agent systems e escreva um resumo"`

---

## Decisoes de Design (vivas — atualizadas conforme evoluem)

1. **File-based, sem banco de dados** — Tudo em YAML, JSON e Markdown. Portabilidade total, versionamento por git, zero dependencias de infra.
2. **Provider-agnostic** — Funciona com qualquer LLM via provider shims. Nao casa com nenhum vendor.
3. **Bun como runtime** — Build rapido, runtime moderno, substitui Node onde possivel.
4. **TypeScript strict** — Tipagem forte em todo o codigo novo. Codigo migrado mantem a tipagem original.
5. **Metafora militar** — Agentes como especialistas, Comandante como orquestrador, tarefas como missoes. Nao e so branding — e modelo mental de organizacao.
6. **Dois repos, zero modificacoes** — OpenClaude e OpenSquad foram apenas lidos, nunca alterados. O CommandOS e independente.

---

## Roadmap (futuro)

- [ ] Web dashboard com autenticacao e dados por usuario
- [ ] Integracao com Telegram (bot para conversar com agentes)
- [ ] Multi-tenant / acesso por terceiros
- [ ] Deploy cloud/VPS
- [ ] Mobile app
