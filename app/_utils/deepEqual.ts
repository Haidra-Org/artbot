export const deepEqual = (obj1: unknown = {}, obj2: unknown = {}): boolean => {
  const isObj1Array = Array.isArray(obj1)
  const isObj2Array = Array.isArray(obj2)

  if (isObj1Array !== isObj2Array) {
    return false
  }

  if (typeof obj1 !== typeof obj2) {
    return false
  }

  if (obj1 === obj2) {
    return true
  }

  if (
    obj1 == null ||
    typeof obj1 != 'object' ||
    obj2 == null ||
    typeof obj2 != 'object'
  ) {
    return false
  }

  const keysObj1 = Object.keys(obj1)
  const keysObj2 = Object.keys(obj2)

  if (keysObj1.length != keysObj2.length) {
    return false
  }

  for (const key of keysObj1) {
    // @ts-expect-error we don't know type
    if (!keysObj2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}
