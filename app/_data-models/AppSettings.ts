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

  // CivitAi Filters
  civitaiShowNsfw: boolean
  civitaiShowSDXL: boolean
  civitaiShowSD15: boolean
  civitaiShowSD21: boolean
}

class AppSettings {
  // Default values to fallback to if key is undefined
  static defaultValues: AppSettingsParams = {
    allowedWorkers: [],
    allowNsfwImages: false,
    apiKey: '0000000000', // Default API key
    autoDowngrade: true,
    blockedWorkers: [],
    negativePanelOpen: false,
    runInBackground: true,
    saveInputOnCreate: true,
    slow_workers: true,
    useAllowedWorkers: false,
    useBeta: false,
    useBlockedWorkers: false,
    useReplacementFilter: true,
    useTrusted: true,

    // CivitAi Filters
    civitaiShowNsfw: false,
    civitaiShowSDXL: true,
    civitaiShowSD15: true,
    civitaiShowSD21: true
  }

  static delete(key: string) {
    const data = this.load()
    delete data[key]
    this.saveAll(data)
  }

  static apikey() {
    return this.get('apiKey') || this.defaultValues.apiKey
  }

  static get<K extends keyof AppSettingsParams>(item: K): AppSettingsParams[K] {
    const data = this.load()

    // Check if the item is undefined using typeof
    return typeof data[item] !== 'undefined'
      ? data[item]
      : this.defaultValues[item]
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
