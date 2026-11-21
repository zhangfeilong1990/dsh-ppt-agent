/**
 * dsh-ppt-agent：把四个 PPT 报告 skill 注册进 DSH 的技能目录。
 *
 * 插件包内的 .dsh/skills/<name>/SKILL.md 是技能本体；
 * 每个技能的 resourceBase 指向其所在目录，因此 SKILL.md 里的
 * ../../assets/*.yaml 可解析到插件包内的 .dsh/assets/。
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const SKILLS_ROOT = join(PACKAGE_ROOT, '.dsh', 'skills')
const PROVIDER_NAME = 'ppt-agent'
const SKILL_RANK = 150

export const name = 'ppt-agent-skills'
export const inject = ['skills']

export function apply(ctx) {
  ctx.skills.registerProvider(() => new PptAgentSkillProvider())
}

class PptAgentSkillProvider {
  name = PROVIDER_NAME

  async list() {
    let entries
    try {
      entries = await readdir(SKILLS_ROOT, { withFileTypes: true })
    } catch {
      return []
    }
    const candidates = []
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue
      const dir = join(SKILLS_ROOT, entry.name)
      const file = join(dir, 'SKILL.md')
      const parsed = await parseSkill(file)
      if (parsed === undefined) continue
      candidates.push(toCandidate(parsed, file, dir))
    }
    return candidates
  }

  async get(candidate) {
    const locator = candidate.locator
    const parsed = await parseSkill(locator.file)
    if (parsed === undefined) return undefined
    return {
      name: parsed.name,
      description: parsed.description,
      ...(parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse }),
      invocation: { modelInvocable: true, userInvocable: true },
      source: PROVIDER_NAME,
      provider: PROVIDER_NAME,
      resourceBase: { kind: 'directory', path: locator.dir },
      path: locator.file,
      content: parsed.body,
    }
  }
}

function toCandidate(parsed, file, dir) {
  return {
    name: parsed.name,
    description: parsed.description,
    ...(parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse }),
    invocation: { modelInvocable: true, userInvocable: true },
    source: PROVIDER_NAME,
    provider: PROVIDER_NAME,
    rank: SKILL_RANK,
    locator: { file, dir },
    resourceBase: { kind: 'directory', path: dir },
    path: file,
  }
}

async function parseSkill(file) {
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return undefined
  }
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (match === null) return undefined
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (pair === null) continue
    const value = pair[2].trim().replace(/^["']|["']$/g, '')
    if (value.length > 0) fields[pair[1]] = value
  }
  if (typeof fields.name !== 'string' || typeof fields.description !== 'string') return undefined
  return {
    name: fields.name,
    description: fields.description,
    whenToUse: fields.whenToUse,
    body: match[2].trim(),
  }
}
