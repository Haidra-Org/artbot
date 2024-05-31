export const debounce = (
  // @ts-expect-error Any sort of args can be in the callback
  func: (...args) => void,
  wait: number = 250
) => {
  let timeout: number | undefined

  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}
