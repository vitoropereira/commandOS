/**
 * CommandOS — Agent Executor
 *
 * Executes routed agents sequentially or in parallel.
 * Manages the execution lifecycle, captures outputs,
 * and persists run history.
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import type { AgentRoute } from './router.js'

export type ExecutionMode = 'sync' | 'async'

export interface ExecutionResult {
  agentId: string
  agentName: string
  output: string
  duration: number
  status: 'success' | 'error'
  error?: string
}

export interface RunRecord {
  id: string
  task: string
  timestamp: string
  mode: ExecutionMode
  results: ExecutionResult[]
  totalDuration: number
}

/**
 * Executes a sequence of agent routes.
 *
 * In sync mode: executes agents one by one, passing output from one to the next.
 * In async mode: executes all agents in parallel (Promise.all).
 *
 * Note: In the current CLI context, "execution" means constructing the
 * agent prompt and dispatching it through the provider system. The actual
 * LLM call happens through the OpenClaude provider shim layer.
 */
export async function executeRoutes(
  routes: AgentRoute[],
  mode: ExecutionMode = 'sync',
): Promise<ExecutionResult[]> {
  if (routes.length === 0) {
    return []
  }

  if (mode === 'async') {
    return executeParallel(routes)
  }

  return executeSequential(routes)
}

async function executeSequential(routes: AgentRoute[]): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []
  let previousOutput = ''

  for (const route of routes) {
    const start = Date.now()

    try {
      // Build the agent's input: original task + any previous output
      const agentInput = previousOutput
        ? `${route.input}\n\n--- Contexto anterior ---\n${previousOutput}`
        : route.input

      // In a full implementation, this would dispatch to the LLM via
      // the provider shim system. For now, we capture the intent.
      const output = `[${route.agent.name}] Processando: "${agentInput.slice(0, 100)}..."`

      const result: ExecutionResult = {
        agentId: route.agentId,
        agentName: route.agent.name,
        output,
        duration: Date.now() - start,
        status: 'success',
      }

      results.push(result)
      previousOutput = output
    } catch (err) {
      results.push({
        agentId: route.agentId,
        agentName: route.agent.name,
        output: '',
        duration: Date.now() - start,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return results
}

async function executeParallel(routes: AgentRoute[]): Promise<ExecutionResult[]> {
  const promises = routes.map(async (route) => {
    const start = Date.now()

    try {
      const output = `[${route.agent.name}] Processando: "${route.input.slice(0, 100)}..."`

      return {
        agentId: route.agentId,
        agentName: route.agent.name,
        output,
        duration: Date.now() - start,
        status: 'success' as const,
      }
    } catch (err) {
      return {
        agentId: route.agentId,
        agentName: route.agent.name,
        output: '',
        duration: Date.now() - start,
        status: 'error' as const,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  })

  return Promise.all(promises)
}

/**
 * Persists a completed run to _commandos/_memory/comandante-runs.json
 */
export async function persistRun(
  task: string,
  results: ExecutionResult[],
  basePath: string = process.cwd(),
): Promise<void> {
  const runsPath = join(basePath, '_commandos', '_memory', 'comandante-runs.json')

  let runs: RunRecord[] = []

  try {
    const existing = await readFile(runsPath, 'utf-8')
    runs = JSON.parse(existing)
  } catch {
    // File doesn't exist yet — start fresh
  }

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  const record: RunRecord = {
    id: generateRunId(),
    task,
    timestamp: new Date().toISOString(),
    mode: 'sync',
    results,
    totalDuration,
  }

  runs.unshift(record) // newest first

  // Keep last 100 runs
  if (runs.length > 100) {
    runs = runs.slice(0, 100)
  }

  await mkdir(dirname(runsPath), { recursive: true })
  await writeFile(runsPath, JSON.stringify(runs, null, 2), 'utf-8')
}

function generateRunId(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}
