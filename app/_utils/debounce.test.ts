import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should call the function after the specified wait time', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('should call the function only once if called multiple times within the wait time', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    debouncedFunc()
    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('should call the function with the latest arguments', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc('first call')
    debouncedFunc('second call')
    debouncedFunc('third call')
    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith('third call')
  })

  it('should restart the wait time if called again within the wait time', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    jest.advanceTimersByTime(50)
    debouncedFunc()
    jest.advanceTimersByTime(50)
    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(50)
    expect(func).toHaveBeenCalledTimes(1)
  })
})
