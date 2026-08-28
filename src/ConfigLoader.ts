import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CONFIG_OVERRIDES_DIR_ENV = 'CONFIG_OVERRIDES_DIR'

let overridePathsPromise: Promise<Set<string>> | undefined
let overridePaths = new Set<string>()
let overridesDirPath = ''
let loadedOverrideCount = 0

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeConfig(defaultValue: unknown, overrideValue: unknown): unknown {
  if (overrideValue === undefined) {
    return defaultValue
  }
  if (Array.isArray(defaultValue)) {
    return Array.isArray(overrideValue) ? overrideValue : defaultValue
  }
  if (isPlainObject(defaultValue) && isPlainObject(overrideValue)) {
    const merged: Record<string, unknown> = { ...defaultValue }
    for (const [key, value] of Object.entries(overrideValue)) {
      merged[key] = mergeConfig(defaultValue[key], value)
    }
    return merged
  }
  return overrideValue
}

function getRelativeConfigPath(modulePath: string): string {
  const cwd = process.cwd()
  const builtRoot = path.join(cwd, 'built')
  if (modulePath.startsWith(`${builtRoot}${path.sep}`)) {
    return path.relative(builtRoot, modulePath)
  }
  if (modulePath.startsWith(`${cwd}${path.sep}`)) {
    return path.relative(cwd, modulePath)
  }
  const builtSegment = `${path.sep}built${path.sep}`
  const builtIndex = modulePath.lastIndexOf(builtSegment)
  if (builtIndex !== -1) {
    return modulePath.substring(builtIndex + builtSegment.length)
  }
  return path.basename(modulePath)
}

function getOverridesDir(): string | undefined {
  const configured = process.env[CONFIG_OVERRIDES_DIR_ENV]
  if (typeof configured === 'string' && configured.trim() !== '') {
    return path.resolve(configured)
  }
  return undefined
}

function normalizePath(value: string): string {
  return value.split(path.sep).join('/')
}

async function getOverridePaths(): Promise<Set<string>> {
  if (overridePathsPromise !== undefined) {
    return overridePathsPromise
  }

  overridePathsPromise = (async () => {
    const maybeOverridesDir = getOverridesDir()
    if (maybeOverridesDir === undefined) {
      overridePaths = new Set()
      return overridePaths
    }
    overridesDirPath = maybeOverridesDir
    try {
      const entries = await fs.readdir(overridesDirPath, {
        recursive: true,
        withFileTypes: true
      })
      overridePaths = new Set(entries
        .filter(a => a.isFile() && a.name.endsWith('.js'))
        .map(a => {
          const p = path.join(a.parentPath, a.name)
          return normalizePath(path.relative(overridesDirPath, p))
        }))
    } catch {
      overridePaths = new Set()
    }
    return overridePaths
  })()

  return overridePathsPromise
}

export async function loadConfig<T>(defaultConfig: T, moduleUrl: string): Promise<T> {
  const modulePath = fileURLToPath(moduleUrl)
  const relativeConfigPath = normalizePath(getRelativeConfigPath(modulePath))
  const paths = await getOverridePaths()

  if (!paths.has(relativeConfigPath)) {
    return defaultConfig
  }

  const overridePath = path.resolve(overridesDirPath, relativeConfigPath)

  try {
    const overrideModule = await import(pathToFileURL(overridePath).href)
    const overrideConfig = (overrideModule.default ?? overrideModule) as unknown

    if (!isPlainObject(overrideConfig) && !Array.isArray(defaultConfig)) {
      return defaultConfig
    }
    loadedOverrideCount++
    return mergeConfig(defaultConfig, overrideConfig) as T
  } catch {
    return defaultConfig
  }
}

export function getLoadedConfigOverrideCount(): number {
  return loadedOverrideCount
}

export { CONFIG_OVERRIDES_DIR_ENV }
