// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): void
  cancel: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): DebouncedFunction<F> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
  }

  return debounced
}
