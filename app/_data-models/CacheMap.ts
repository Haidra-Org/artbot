type MapEntry<V> = {
  value: V
  timestamp: number
}

interface LimitedMapOptions {
  limit?: number
  expireMinutes?: number
}

class CacheMap<K, V> {
  private limit: number
  private maxAgeMilliseconds: number
  private map: Map<K, MapEntry<V>>
  private order: K[]

  constructor({ limit = 30, expireMinutes = 20 }: LimitedMapOptions) {
    this.limit = limit
    this.maxAgeMilliseconds = expireMinutes * 60 * 1000 // Convert max age to milliseconds
    this.map = new Map<K, MapEntry<V>>() // Initialize the map with generic types K and V
    this.order = [] // Array to keep track of the order of keys
  }

  // Helper method to get the current timestamp
  private getCurrentTimestamp(): number {
    return Date.now()
  }

  // Custom set method to add items to the Map with a timestamp
  set(key: K, value: V): void {
    const timestamp = this.getCurrentTimestamp()

    if (this.map.has(key)) {
      // If the key already exists, update the value and reorder the key
      this.order = this.order.filter((k) => k !== key)
    } else if (this.map.size >= this.limit) {
      // If the limit is reached, remove the oldest item
      const oldestKey = this.order.shift() // Remove the oldest key from the order array
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey) // Delete the oldest key from the map
      }
    }

    // Add the new key, value, and timestamp to the map
    this.map.set(key, { value, timestamp })
    this.order.push(key) // Push the new key to the end of the order array
  }

  // Custom get method to retrieve items from the Map, considering their age
  get<T = V>(key: K): T | undefined {
    const entry = this.map.get(key)

    if (!entry) {
      return undefined
    }

    const { value, timestamp } = entry
    const currentTimestamp = this.getCurrentTimestamp()
    const age = currentTimestamp - timestamp

    if (age > this.maxAgeMilliseconds) {
      // If the item is older than the max age, remove it and return undefined
      this.delete(key)
      return undefined
    }

    return value as unknown as T // Return the value with type assertion
  }

  // Custom delete method to remove specific items from the Map
  delete(key: K): boolean {
    if (this.map.has(key)) {
      this.order = this.order.filter((k) => k !== key) // Remove the key from the order array
      return this.map.delete(key) // Delete the key from the map
    }
    return false
  }

  // Method to get the size of the Map
  size(): number {
    return this.map.size
  }

  // Method to clear all items from the Map
  clear(): void {
    this.map.clear()
    this.order = []
  }

  // Method to check if a key exists in the Map
  has(key: K): boolean {
    return this.map.has(key)
  }

  // Method to iterate over the Map's key-value pairs
  entries(): [K, V][] {
    return Array.from(this.map.entries()).map(([key, { value }]) => [
      key,
      value
    ])
  }

  // Method to iterate over the Map's keys
  keys(): IterableIterator<K> {
    return this.map.keys()
  }

  // Method to iterate over the Map's values
  values(): V[] {
    return Array.from(this.map.values()).map(({ value }) => value)
  }
}

export default CacheMap
