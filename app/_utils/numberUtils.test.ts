import { formatKudos } from './numberUtils'

describe('formatKudos', () => {
  test('returns "..." when the number is 0', () => {
    expect(formatKudos(0)).toBe('...')
  })

  test('returns the number as a string when it is less than 1000', () => {
    expect(formatKudos(999)).toBe('999')
    expect(formatKudos(1)).toBe('1')
  })

  test('formats numbers less than 1,000,000 with a "K" suffix', () => {
    expect(formatKudos(1000)).toBe('1.0K')
    expect(formatKudos(999999)).toBe('1.0M')
  })

  test('formats numbers less than 1,000,000,000 with an "M" suffix', () => {
    expect(formatKudos(1000000)).toBe('1.0M')
    expect(formatKudos(999999999)).toBe('1.0B')
  })

  test('formats numbers 1,000,000,000 and above with a "B" suffix', () => {
    expect(formatKudos(1000000000)).toBe('1.0B')
    expect(formatKudos(1500000000)).toBe('1.5B')
  })

  test('handles edge cases correctly', () => {
    expect(formatKudos(999)).toBe('999')
    expect(formatKudos(1000000)).toBe('1.0M')
    expect(formatKudos(999999999)).toBe('1.0B')
    expect(formatKudos(1000000000)).toBe('1.0B')
  })
})
