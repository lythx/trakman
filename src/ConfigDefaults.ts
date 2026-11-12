const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)

/**
 * Fills in missing (undefined) settings of a user config with hard-coded defaults.
 * Nested plain objects are merged recursively, arrays and primitives are taken as-is from the user config when present.
 * This keeps the controller running with outdated config files that lack newly added settings.
 * @param config User config object (e.g. imported from a `.js` config file)
 * @param defaults Hard-coded defaults for the settings that must be present
 * @returns Config object with all defaults applied
 */
export function withDefaults<T extends object, D extends object>(config: T, defaults: D): T & D {
  const result: Record<string, unknown> = { ...(defaults as object), ...(config as object) }
  for (const key in defaults) {
    const userValue = (config as Record<string, unknown>)[key]
    const defaultValue = (defaults as Record<string, unknown>)[key]
    if (userValue === undefined) {
      result[key] = defaultValue
    } else if (isPlainObject(userValue) && isPlainObject(defaultValue)) {
      result[key] = withDefaults(userValue, defaultValue)
    }
  }
  return result as T & D
}
