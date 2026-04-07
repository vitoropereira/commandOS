/**
 * CommandOS — Agent Onboarding
 *
 * Interactive CLI flow for creating and registering new agents.
 * Creates the agent directory, agent.yaml, memory.md, and updates _index.yaml.
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export interface OnboardInput {
  name: string
  id: string
  role: string
  provider: string
  model: string
  skills: string[]
  behavior: string
  initialMemory: string
}

/**
 * Creates a new agent from onboarding input.
 *
 * Creates:
 * - _commandos/agents/{id}/agent.yaml
 * - _commandos/agents/{id}/memory.md
 * - Updates _commandos/agents/_index.yaml
 */
export async function createAgent(
  input: OnboardInput,
  basePath: string = process.cwd(),
): Promise<void> {
  const agentDir = join(basePath, '_commandos', 'agents', input.id)
  const agentPath = join(agentDir, 'agent.yaml')
  const memoryPath = join(agentDir, 'memory.md')
  const indexPath = join(basePath, '_commandos', 'agents', '_index.yaml')

  // Create agent directory
  await mkdir(agentDir, { recursive: true })

  // Create agent.yaml
  const agentYaml = {
    name: input.name,
    id: input.id,
    description: input.role,
    provider: input.provider,
    model: input.model,
    skills: input.skills,
    status: 'active',
    behavior: input.behavior,
    created: new Date().toISOString().split('T')[0],
  }

  await writeFile(agentPath, stringifyYaml(agentYaml), 'utf-8')

  // Create memory.md
  const memoryContent = `# Agent Memory: ${input.name}

## Contexto Inicial

${input.initialMemory || 'Nenhum contexto inicial definido.'}

## Aprendizados

## Preferências do Usuário
`

  await writeFile(memoryPath, memoryContent, 'utf-8')

  // Update _index.yaml
  let indexData: { agents: Array<{ id: string; name: string }> } = { agents: [] }

  try {
    const indexContent = await readFile(indexPath, 'utf-8')
    indexData = parseYaml(indexContent) || { agents: [] }
  } catch {
    // File doesn't exist yet
  }

  if (!indexData.agents) {
    indexData.agents = []
  }

  // Check for duplicate
  const exists = indexData.agents.some(a => a.id === input.id)
  if (!exists) {
    indexData.agents.push({
      id: input.id,
      name: input.name,
    })
  }

  await writeFile(indexPath, stringifyYaml(indexData), 'utf-8')
}

/**
 * Lists available skills from _commandos/skills/ for selection during onboarding.
 */
export async function listAvailableSkills(
  basePath: string = process.cwd(),
): Promise<string[]> {
  const { readdir } = await import('fs/promises')
  const skillsDir = join(basePath, '_commandos', 'skills')

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
  } catch {
    return []
  }
}
