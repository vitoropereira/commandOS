/**
 * CommandOS — Agent Router
 *
 * Loads registered agents from _commandos/agents/_index.yaml and routes
 * incoming tasks to the most appropriate agent(s) based on their
 * descriptions and skills.
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { parse as parseYaml } from 'yaml'

export interface Agent {
  id: string
  name: string
  description: string
  provider: string
  model: string
  skills: string[]
  status: 'active' | 'inactive'
}

export interface AgentRoute {
  agentId: string
  agent: Agent
  input: string
  priority: number
}

/**
 * Loads all registered agents from _commandos/agents/_index.yaml
 */
export async function loadAgents(basePath: string = process.cwd()): Promise<Agent[]> {
  const indexPath = join(basePath, '_commandos', 'agents', '_index.yaml')

  try {
    const content = await readFile(indexPath, 'utf-8')
    const data = parseYaml(content)

    if (!data?.agents || !Array.isArray(data.agents)) {
      return []
    }

    const agents: Agent[] = []

    for (const entry of data.agents) {
      const agentDir = join(basePath, '_commandos', 'agents', entry.id)
      const agentPath = join(agentDir, 'agent.yaml')

      try {
        const agentContent = await readFile(agentPath, 'utf-8')
        const agentData = parseYaml(agentContent)

        agents.push({
          id: entry.id,
          name: agentData.name || entry.id,
          description: agentData.description || '',
          provider: agentData.provider || 'anthropic',
          model: agentData.model || 'claude-sonnet-4-6',
          skills: agentData.skills || [],
          status: (agentData.status as 'active' | 'inactive') || 'active',
        })
      } catch {
        // Skip agents whose YAML can't be loaded
        continue
      }
    }

    return agents
  } catch {
    return []
  }
}

/**
 * Routes a natural language task to the appropriate agent(s).
 *
 * Uses keyword matching and agent descriptions to determine the best
 * routing. For more sophisticated routing, this can be extended to use
 * an LLM call to analyze the task and select agents.
 */
export async function routeTask(
  task: string,
  basePath: string = process.cwd(),
): Promise<AgentRoute[]> {
  const agents = await loadAgents(basePath)
  const activeAgents = agents.filter(a => a.status === 'active')

  if (activeAgents.length === 0) {
    return []
  }

  const taskLower = task.toLowerCase()
  const routes: AgentRoute[] = []

  // Score each agent based on keyword relevance
  for (const agent of activeAgents) {
    let score = 0
    const descLower = agent.description.toLowerCase()
    const nameLower = agent.name.toLowerCase()

    // Check if task mentions agent name
    if (taskLower.includes(nameLower)) {
      score += 10
    }

    // Check keyword overlap between task and agent description
    const taskWords = taskLower.split(/\s+/).filter(w => w.length > 3)
    const descWords = descLower.split(/\s+/).filter(w => w.length > 3)

    for (const tw of taskWords) {
      for (const dw of descWords) {
        if (tw === dw || dw.includes(tw) || tw.includes(dw)) {
          score += 2
        }
      }
    }

    // Check skill relevance
    for (const skill of agent.skills) {
      if (taskLower.includes(skill.toLowerCase())) {
        score += 5
      }
    }

    // Common task patterns
    if (/pesquis|search|busca|investig|find|research/.test(taskLower) &&
        /pesquis|research|busca|search/.test(descLower)) {
      score += 8
    }
    if (/escrev|write|redigi|redat|text|artigo|resumo|summar/.test(taskLower) &&
        /escrev|write|redat|text|redação/.test(descLower)) {
      score += 8
    }
    if (/analis|analyz|dados|data|insight|padr|pattern/.test(taskLower) &&
        /analis|analyz|dados|data|insight/.test(descLower)) {
      score += 8
    }

    if (score > 0) {
      routes.push({
        agentId: agent.id,
        agent,
        input: task,
        priority: score,
      })
    }
  }

  // Sort by priority (highest first)
  routes.sort((a, b) => b.priority - a.priority)

  // If no routes matched, assign to all active agents as fallback
  if (routes.length === 0) {
    return activeAgents.map((agent, i) => ({
      agentId: agent.id,
      agent,
      input: task,
      priority: activeAgents.length - i,
    }))
  }

  return routes
}
