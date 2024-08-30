// queueSystem.ts

type QueueTask<T> = () => Promise<T>

interface QueueSystemOptions {
  preventDuplicates: boolean
}

export class TaskQueue<T> {
  private queue: Array<{ id: string; task: () => Promise<void> }> = []
  private isProcessing = false
  private intervalMs: number
  private name: string
  private preventDuplicates: boolean
  private currentTaskId: string | null = null

  constructor(
    name: string,
    intervalMs: number,
    options: QueueSystemOptions = { preventDuplicates: false }
  ) {
    this.intervalMs = intervalMs
    this.name = name
    this.preventDuplicates = options.preventDuplicates
  }

  enqueue(task: QueueTask<T>, taskId: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          console.log(
            `[${this.name}] Executing task ${taskId}. Queue length: ${this.queue.length}`
          )
          const result = await task()
          resolve(result)
        } catch (error) {
          console.error(`[${this.name}] Task ${taskId} execution error:`, error)
          reject(error)
        } finally {
          console.log(
            `[${this.name}] Task ${taskId} completed. Queue length: ${this.queue.length}`
          )
          this.currentTaskId = null
        }
      }

      if (
        this.preventDuplicates &&
        (this.currentTaskId === taskId ||
          this.queue.some((item) => item.id === taskId))
      ) {
        console.log(`[${this.name}] Duplicate task ${taskId} prevented`)
        return
      }

      this.queue.push({ id: taskId, task: wrappedTask })
      console.log(
        `[${this.name}] Task ${taskId} enqueued. Queue length: ${this.queue.length}`
      )
      this.processQueue()
    })
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    const nextTask = this.queue.shift()
    if (nextTask) {
      this.currentTaskId = nextTask.id
      nextTask.task().finally(() => {
        setTimeout(() => {
          this.isProcessing = false
          this.processQueue()
        }, this.intervalMs)
      })
    } else {
      this.isProcessing = false
    }
  }
}
