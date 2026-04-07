/**
 * CommandOS — Memory Module
 *
 * Handles reading/writing persistent memory for the Comandante:
 * - Configuration from _commandos/_memory/comandante-config.yaml
 * - Run history from _commandos/_memory/comandante-runs.json
 * - Company context from _commandos/_memory/company.md
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import type { RunRecord } from './executor.js'

export interface ComandanteConfig {
  version: string
  project: string
  default_mode: 'sync' | 'async'
  default_provider: string
  default_model: string
  max_concurrent_agents: number
  approval_required: boolean
  log_all_runs: boolean
  paths: {
    agents: string
    skills: string
    squads: string
    memory: string
    prompts: string
  }
}

const DEFAULT_CONFIG: ComandanteConfig = {
  version: '1.0.0',
  project: 'commandOS',
  default_mode: 'sync',
  default_provider: 'anthropic',
  default_model: 'claude-sonnet-4-6',
  max_concurrent_agents: 3,
  approval_required: true,
  log_all_runs: true,
  paths: {
    agents: '_commandos/agents',
    skills: '_commandos/skills',
    squads: '_commandos/squads',
    memory: '_commandos/_memory',
    prompts: '_commandos/core/prompts',
  },
}

/**
 * Loads the Comandante configuration from YAML.
 * Returns default config if file doesn't exist.
 */
export async function loadConfig(basePath: string = process.cwd()): Promise<ComandanteConfig> {
  const configPath = join(basePath, '_commandos', '_memory', 'comandante-config.yaml')

  try {
    const content = await readFile(configPath, 'utf-8')
    const data = parseYaml(content)
    return { ...DEFAULT_CONFIG, ...data?.comandante }
  } catch {
    return DEFAULT_CONFIG
  }
}

/**
 * Saves the Comandante configuration to YAML.
 */
export async function saveConfig(
  config: ComandanteConfig,
  basePath: string = process.cwd(),
): Promise<void> {
  const configPath = join(basePath, '_commandos', '_memory', 'comandante-config.yaml')
  await mkdir(dirname(configPath), { recursive: true })
  const content = stringifyYaml({ comandante: config })
  await writeFile(configPath, content, 'utf-8')
}

/**
 * Loads run history from JSON.
 */
export async function loadRuns(basePath: string = process.cwd()): Promise<RunRecord[]> {
  const runsPath = join(basePath, '_commandos', '_memory', 'comandante-runs.json')

  try {
    const content = await readFile(runsPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/**
 * Loads company context from markdown.
 */
export async function loadCompanyContext(basePath: string = process.cwd()): Promise<string> {
  const companyPath = join(basePath, '_commandos', '_memory', 'company.md')

  try {
    return await readFile(companyPath, 'utf-8')
  } catch {
    return ''
  }
}
