// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function throttle<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let inThrottle = false
  let lastPromise: Promise<ReturnType<T>> | null = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    if (!inThrottle) {
      inThrottle = true
      lastPromise = func.apply(this, args)
      setTimeout(() => {
        inThrottle = false
      }, limit)
      return lastPromise
    } else {
      return lastPromise || Promise.reject('Function throttled')
    }
  }
}
