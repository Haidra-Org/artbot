import { AppSettings, AppSettingsParams, rootSettingsKey } from './AppSettings'

describe('AppSettings', () => {
  const initialSettings: AppSettingsParams = {
    allowedWorkers: [{ value: 'worker1' }],
    allowNsfwImages: false,
    apiKey: 'testApiKey',
    autoDowngrade: true,
    blockedWorkers: [{ value: 'worker2' }],
    civitAiBaseModelFilter: ['SD 2.x'],
    negativePanelOpen: false,
    runInBackground: true,
    saveInputOnCreate: false,
    slow_workers: true,
    useAllowedWorkers: false,
    useBeta: false,
    useBlockedWorkers: false,
    useReplacementFilter: false,
    useTrusted: false
  }

  const mockLocalStorage = (() => {
    let store: { [key: string]: string } = {}
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        store = {}
      })
    }
  })()

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage
    })

    // Initialize localStorage with initial settings
    localStorage.setItem(
      rootSettingsKey,
      JSON.stringify({ v: '2', ...initialSettings })
    )
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  test('should load settings from localStorage', () => {
    const settings = AppSettings.load()
    expect(settings).toEqual({ v: '2', ...initialSettings })
  })

  test('should get specific setting from localStorage', () => {
    const apiKey = AppSettings.get('apiKey')
    expect(apiKey).toBe('testApiKey')
  })

  test('should return default API key if none is set', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValueOnce('{}')
    const apiKey = AppSettings.apikey()
    expect(apiKey).toBe('0000000000')
  })

  test('should save all settings to localStorage', () => {
    AppSettings.saveAll(initialSettings)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      rootSettingsKey,
      JSON.stringify({ v: '2', ...initialSettings })
    )
  })

  test('should set a specific setting in localStorage', () => {
    AppSettings.set('apiKey', 'newApiKey')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      rootSettingsKey,
      JSON.stringify({ v: '2', ...initialSettings, apiKey: 'newApiKey' })
    )
  })

  test('should delete a specific setting from localStorage', () => {
    AppSettings.delete('apiKey')
    const expectedSettings = { ...initialSettings }

    // @ts-expect-error Disable TypeScript checks for testing
    delete expectedSettings.apiKey
    expect(localStorage.setItem).toHaveBeenCalledWith(
      rootSettingsKey,
      JSON.stringify({ v: '2', ...expectedSettings })
    )
  })
})
