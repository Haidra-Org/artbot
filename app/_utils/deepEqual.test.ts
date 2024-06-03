import { deepEqual } from './deepEqual'

describe('deepEqual', () => {
  it('should return true for identical primitive values', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('string', 'string')).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
  })

  it('should return false for different primitive values', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('string', 'different')).toBe(false)
    expect(deepEqual(true, false)).toBe(false)
  })

  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: 'string', c: true }
    const obj2 = { a: 1, b: 'string', c: true }
    expect(deepEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for objects with different values', () => {
    const obj1 = { a: 1, b: 'string', c: true }
    const obj2 = { a: 2, b: 'string', c: true }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return false for objects with different keys', () => {
    const obj1 = { a: 1, b: 'string' }
    const obj2 = { a: 1, b: 'string', c: true }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for nested objects that are deeply equal', () => {
    const obj1 = { a: { b: { c: 1 } } }
    const obj2 = { a: { b: { c: 1 } } }
    expect(deepEqual(obj1, obj2)).toBe(true)
  })

  it('should return false for nested objects that are not deeply equal', () => {
    const obj1 = { a: { b: { c: 1 } } }
    const obj2 = { a: { b: { c: 2 } } }
    expect(deepEqual(obj1, obj2)).toBe(false)
  })

  it('should return true for arrays with identical values', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]
    expect(deepEqual(arr1, arr2)).toBe(true)
  })

  it('should return false for arrays with different values', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 4]
    expect(deepEqual(arr1, arr2)).toBe(false)
  })

  it('should return false for null values', () => {
    expect(deepEqual(null, {})).toBe(false)
    expect(deepEqual({}, null)).toBe(false)
    expect(deepEqual(null, null)).toBe(true)
  })

  it('should return true for undefined values', () => {
    // Returns true because we always cast undefined to {}
    expect(deepEqual(undefined, {})).toBe(true)
    expect(deepEqual({}, undefined)).toBe(true)
    expect(deepEqual(undefined, undefined)).toBe(true)
  })

  it('should return false for objects and arrays comparison', () => {
    expect(deepEqual({}, [])).toBe(false)
    expect(deepEqual([], {})).toBe(false)
  })

  it('should handle special cases with different types', () => {
    expect(deepEqual(0, '0')).toBe(false)
    expect(deepEqual(false, 0)).toBe(false)
  })
})
