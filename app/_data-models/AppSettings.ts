/**
 * App Settings
 *
 * Save and load settings from browser's localStorage
 */

export const rootSettingsKey = 'ArtBotSettings'

export interface AppSettingsParams {
  allowedWorkers: Array<{ value: string }>
  allowNsfwImages: boolean
  apiKey: string
  autoDowngrade: boolean
  blockedWorkers: Array<{ value: string }>
  negativePanelOpen: boolean
  runInBackground: boolean
  saveInputOnCreate: boolean
  slow_workers: boolean
  useAllowedWorkers: boolean
  useBeta: boolean
  useBlockedWorkers: boolean
  useReplacementFilter: boolean
  useTrusted: boolean
}

class AppSettings {
  static delete(key: string) {
    const data = this.load()
    delete data[key]
    this.saveAll(data)
  }

  static apikey() {
    // Return AI Horde's anonymous API key if no API key is set
    return this.get('apiKey') || '0000000000'
  }

  static get<K extends keyof AppSettingsParams>(item: K): AppSettingsParams[K] {
    const data = this.load()

    return data[item]
  }

  static load() {
    try {
      const string = localStorage.getItem(rootSettingsKey) || '{}'
      const data = JSON.parse(string)

      return data
    } catch (err) {
      return {}
    }
  }

  static saveAll(params: AppSettingsParams) {
    try {
      // Save version in case we update settings params at a later time.
      const data = { v: '2', ...params }
      const string = JSON.stringify(data)
      localStorage.setItem(rootSettingsKey, string)
    } catch (err) {
      localStorage.setItem(rootSettingsKey, '{}')
    }
  }

  static set<K extends keyof AppSettingsParams>(
    key: K,
    val: AppSettingsParams[K]
  ) {
    const data = this.load()
    data[key] = val
    this.saveAll(data)
  }
}

export { AppSettings }
