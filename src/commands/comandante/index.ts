import type { Command } from '../../commands.js'

const comandante = {
  type: 'prompt',
  name: 'comandante',
  description: 'CommandOS mission orchestrator — manage agents, run tasks, view logs',
  progressMessage: 'coordinating agents',
  contentLength: 5000,
  source: 'builtin' as const,
  aliases: ['cmd'],
  async getPromptForCommand(args: string) {
    const subcommand = args.trim().split(/\s+/)[0]?.toLowerCase() || ''
    const rest = args.trim().slice(subcommand.length).trim()

    const prompt = buildPrompt(subcommand, rest)

    return [
      {
        type: 'text' as const,
        text: prompt,
      },
    ]
  },
} satisfies Command

function buildPrompt(subcommand: string, args: string): string {
  switch (subcommand) {
    case 'run':
      return `# CommandOS — Run Mission

You are the Comandante, the central orchestrator of CommandOS.

## Mission
Execute the following task by coordinating the appropriate agents:

**Task:** ${args || '[user did not specify a task — ask what they want to accomplish]'}

## Instructions

1. Read \`_commandos/agents/_index.yaml\` to see all registered agents
2. For each agent listed, read \`_commandos/agents/{id}/agent.yaml\` to understand capabilities
3. Read \`_commandos/_memory/comandante-config.yaml\` for execution settings
4. Analyze the task and determine which agent(s) to use and in what order
5. For each agent in sequence:
   a. Announce: "🎖️ Dispatching {agent name}..."
   b. Read the agent's \`agent.yaml\` for its behavior instructions
   c. Execute the task as that agent (adopt its persona, follow its instructions)
   d. Save the output
   e. If there's a next agent, pass the output as context
6. Consolidate all outputs into a final deliverable
7. Present the result to the user
8. Save the run to \`_commandos/_memory/comandante-runs.json\` with timestamp, agents used, duration, and status

## Output Format
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎖️ Mission Complete
📋 Task: {task summary}
🤖 Agents: {agent1} → {agent2} → ...
⏱️ Duration: {time}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{consolidated output}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``

    case 'agents':
      return `# CommandOS — List Agents

Read \`_commandos/agents/_index.yaml\` to get all registered agents.
For each agent, read \`_commandos/agents/{id}/agent.yaml\` to get details.

Present as a formatted list:
\`\`\`
🎖️ CommandOS — Registered Agents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{icon} {name} ({model})
   {description}
   Skills: {skills list or "none"}
   Status: {active/inactive}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

If no agents are found, suggest using \`/comandante onboard\` to create one.`

    case 'onboard':
      return `# CommandOS — Onboard New Agent

Guide the user through creating a new agent interactively.

Ask these questions ONE AT A TIME (do not present them all at once):

1. "Qual é o nome do agente?" (display name)
2. "Qual o ID? (slug sem espaços, ex: pesquisador)"
3. "Qual é o papel/especialidade desse agente?"
4. "Qual provider LLM?" — present options: anthropic, openai, gemini, ollama
5. "Qual modelo?" — suggest defaults based on provider
6. "Quais skills associar?" — read \`_commandos/skills/\` to list available skills, let user select or skip
7. "Descreva o comportamento do agente em 2-3 frases"
8. "Contexto inicial (memória base do agente):" — or skip

After collecting all answers, create these files:

1. \`_commandos/agents/{id}/agent.yaml\` with:
   \`\`\`yaml
   name: "{name}"
   id: "{id}"
   description: "{role}"
   provider: "{provider}"
   model: "{model}"
   skills: [{skills}]
   status: active
   behavior: "{behavior}"
   created: "{today's date}"
   \`\`\`

2. \`_commandos/agents/{id}/memory.md\` with initial context

3. Update \`_commandos/agents/_index.yaml\` — add new entry to agents list

Present confirmation:
\`\`\`
✓ Criando _commandos/agents/{id}/agent.yaml
✓ Criando _commandos/agents/{id}/memory.md
✓ Atualizando _commandos/agents/_index.yaml
✓ Agente "{name}" registrado no CommandOS
\`\`\``

    case 'logs':
      return `# CommandOS — Execution Logs

Read \`_commandos/_memory/comandante-runs.json\`.

If the file exists, present runs in reverse chronological order:
\`\`\`
📋 CommandOS — Execution History
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[{timestamp}] "{task}"
  Agents: {agent list with arrows}
  Duration: {time} | Status: {✅ success / ❌ error}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

If no runs exist, show: "No execution history yet. Use \`/comandante run <task>\` to start."
${args ? `\nShow last ${args} runs.` : 'Show last 10 runs.'}`

    case 'squads':
      return `# CommandOS — List Squads

Read all directories in \`_commandos/squads/\`.
For each directory containing a \`squad.yaml\`, read it to extract name, description, icon, and agent count.

Present as:
\`\`\`
🎖️ CommandOS — Available Squads
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{icon} {name}
   {description}
   {agent count} agents | Pipeline: {step count} steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

If no squads found, inform the user.`

    case 'skills':
      return `# CommandOS — List Skills

Read all directories in \`_commandos/skills/\`.
For each directory containing a \`SKILL.md\`, parse the YAML frontmatter.

Present as:
\`\`\`
🎖️ CommandOS — Available Skills
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{type icon} {name} v{version} ({type})
   {description}
   Categories: {categories}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

Type icons: 🔌 mcp | 📜 script | 🔀 hybrid | 💡 prompt`

    case 'status':
      return `# CommandOS — Status

Read \`_commandos/_memory/comandante-config.yaml\` and display:
\`\`\`
🎖️ CommandOS — Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version:          {version}
Default Mode:     {sync/async}
Default Provider: {provider}
Default Model:    {model}
Max Concurrent:   {max_concurrent_agents}
Approval Required: {yes/no}
Log All Runs:     {yes/no}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paths:
  Agents:  {agents path}
  Skills:  {skills path}
  Squads:  {squads path}
  Memory:  {memory path}
  Prompts: {prompts path}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

Also count: registered agents, installed skills, available squads, total runs.`

    default:
      return `# CommandOS — Comandante Menu

You are the Comandante, the central orchestrator of CommandOS.

Present the main menu:
\`\`\`
🎖️ CommandOS — Comandante
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /comandante run <tarefa>    Send a task to be orchestrated
  /comandante agents          List registered agents
  /comandante onboard         Create a new agent
  /comandante logs            View execution history
  /comandante squads          List available squads
  /comandante skills          List available skills
  /comandante status          Show configuration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

${args ? `The user typed: "${args}". Try to match their intent to one of the subcommands above and execute it.` : 'Ask what they would like to do.'}`
  }
}

export default comandante
