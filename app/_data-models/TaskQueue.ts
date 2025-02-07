// queueSystem.ts

type QueueTask<T> = () => Promise<T>;

interface QueueSystemOptions {
  preventDuplicates: boolean;
}

export class TaskQueue<T> {
  private queue: Array<{ id: string; task: () => Promise<void> }> = [];
  private isProcessing = false;
  private intervalMs: number;
  private preventDuplicates: boolean;
  private currentTaskId: string | null = null;

  constructor(
    intervalMs: number,
    options: QueueSystemOptions = { preventDuplicates: false }
  ) {
    this.intervalMs = intervalMs;
    this.preventDuplicates = options.preventDuplicates;
  }

  enqueue(task: QueueTask<T>, taskId: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentTaskId = null;
        }
      };

      if (
        this.preventDuplicates &&
        (this.currentTaskId === taskId ||
          this.queue.some((item) => item.id === taskId))
      ) {
        return;
      }

      this.queue.push({ id: taskId, task: wrappedTask });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const nextTask = this.queue.shift();
    if (nextTask) {
      this.currentTaskId = nextTask.id;
      nextTask.task().finally(() => {
        setTimeout(() => {
          this.isProcessing = false;
          this.processQueue();
        }, this.intervalMs);
      });
    } else {
      this.isProcessing = false;
    }
  }
}
