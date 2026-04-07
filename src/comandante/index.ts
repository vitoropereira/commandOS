/**
 * CommandOS — Comandante Module
 *
 * Central orchestration engine that coordinates specialized AI agents.
 * Receives tasks in natural language, routes them to the best-suited agents,
 * executes the pipeline, and consolidates results.
 */

export { loadAgents, routeTask } from './router.js'
export { executeRoutes, persistRun } from './executor.js'
export { loadConfig, type ComandanteConfig } from './memory.js'
export type { Agent, AgentRoute } from './router.js'
export type { ExecutionMode, ExecutionResult } from './executor.js'
