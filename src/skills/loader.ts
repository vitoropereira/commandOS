/**
 * CommandOS — Unified Skill Loader
 *
 * Discovers and loads skills from _commandos/skills/.
 * Parses SKILL.md files with YAML frontmatter and returns
 * a typed array consumable by the rest of the system.
 *
 * Compatible with the OpenClaude skill loading interface.
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export type SkillType = 'mcp' | 'script' | 'hybrid' | 'prompt'

export interface Skill {
  id: string
  name: string
  description: string
  type: SkillType
  version: string
  categories: string[]
  env: string[]
  mcp?: {
    server_name: string
    transport: 'stdio' | 'http'
    command?: string
    args?: string[]
    url?: string
    headers?: Record<string, string>
  }
  script?: {
    path: string
    runtime: 'node' | 'python' | 'bash'
    dependencies: string[]
  }
  body: string // Markdown content after frontmatter
}

/**
 * Loads all skills from _commandos/skills/.
 * A skill is detected by the presence of SKILL.md in its directory.
 */
export async function loadSkills(basePath: string = process.cwd()): Promise<Skill[]> {
  const skillsDir = join(basePath, '_commandos', 'skills')
  const skills: Skill[] = []

  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(skillsDir, { withFileTypes: true })
  } catch {
    return []
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const skillPath = join(skillsDir, entry.name, 'SKILL.md')

    try {
      const content = await readFile(skillPath, 'utf-8')
      const skill = parseSkillMd(entry.name, content)
      if (skill) {
        skills.push(skill)
      }
    } catch {
      // Skip skills that can't be read
      continue
    }
  }

  return skills
}

/**
 * Parses a SKILL.md file into a Skill object.
 */
function parseSkillMd(id: string, content: string): Skill | null {
  const normalized = content.replace(/\r\n/g, '\n')
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---/)

  if (!fmMatch) return null

  const fm = fmMatch[1]
  const body = normalized.slice(fmMatch[0].length).trim()

  // Parse frontmatter fields
  const name = extractField(fm, 'name') || id
  const type = (extractField(fm, 'type') || 'prompt') as SkillType
  const version = extractField(fm, 'version') || '0.0.0'

  // Description — handle YAML folded scalar (>)
  let description = ''
  const descBlock = fm.match(/^description:\s*>\s*\n((?:\s{2,}.+\n?)+)/m)
  if (descBlock) {
    description = descBlock[1].replace(/\n\s*/g, ' ').trim()
  } else {
    description = extractField(fm, 'description') || ''
  }

  // Categories
  const categories = extractList(fm, 'categories')

  // Env vars
  const env = extractList(fm, 'env')

  // MCP config
  let mcp: Skill['mcp']
  if (type === 'mcp' || type === 'hybrid') {
    mcp = {
      server_name: extractNestedField(fm, 'mcp', 'server_name') || id,
      transport: (extractNestedField(fm, 'mcp', 'transport') || 'stdio') as 'stdio' | 'http',
      command: extractNestedField(fm, 'mcp', 'command'),
      url: extractNestedField(fm, 'mcp', 'url'),
    }

    // Parse args
    const argsMatch = fm.match(/^\s+args:\s*\n((?:\s+-\s+.+\n?)+)/m)
    if (argsMatch) {
      mcp.args = argsMatch[1]
        .split('\n')
        .map(line => line.match(/^\s+-\s+(.+)/)?.[1]?.trim())
        .filter((s): s is string => !!s)
    }
  }

  // Script config
  let script: Skill['script']
  if (type === 'script' || type === 'hybrid') {
    script = {
      path: extractNestedField(fm, 'script', 'path') || '',
      runtime: (extractNestedField(fm, 'script', 'runtime') || 'node') as 'node' | 'python' | 'bash',
      dependencies: [],
    }
  }

  return {
    id,
    name,
    description,
    type,
    version,
    categories,
    env,
    mcp,
    script,
    body,
  }
}

function extractField(fm: string, field: string): string | undefined {
  const match = fm.match(new RegExp(`^${field}:\\s*"?(.+?)"?$`, 'm'))
  return match?.[1]?.trim()
}

function extractNestedField(fm: string, parent: string, field: string): string | undefined {
  const parentMatch = fm.match(new RegExp(`^${parent}:.*\\n([\\s\\S]*?)(?=^\\w|$)`, 'm'))
  if (!parentMatch) return undefined
  const nested = parentMatch[1]
  const fieldMatch = nested.match(new RegExp(`^\\s+${field}:\\s*"?(.+?)"?$`, 'm'))
  return fieldMatch?.[1]?.trim()
}

function extractList(fm: string, field: string): string[] {
  // Inline format: categories: [tag1, tag2]
  const inlineMatch = fm.match(new RegExp(`^${field}:\\s*\\[(.+)\\]`, 'm'))
  if (inlineMatch) {
    return inlineMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
  }

  // Block format:
  // categories:
  //   - tag1
  //   - tag2
  const blockMatch = fm.match(new RegExp(`^${field}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, 'm'))
  if (blockMatch) {
    return blockMatch[1]
      .split('\n')
      .map(line => line.match(/^\s+-\s+(.+)/)?.[1]?.trim())
      .filter((s): s is string => !!s)
  }

  return []
}
