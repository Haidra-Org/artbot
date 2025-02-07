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
  private taskTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
          // Set a timeout to automatically cleanup stuck tasks
          const timeout = setTimeout(() => {
            console.warn(`Task ${taskId} timed out after 30s`);
            this.cleanupTask(taskId);
            reject(new Error('Task timed out'));
          }, 30000);

          this.taskTimeouts.set(taskId, timeout);

          const result = await task();
          clearTimeout(timeout);
          this.taskTimeouts.delete(taskId);
          resolve(result);
        } catch (error) {
          this.cleanupTask(taskId);
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
        resolve(undefined as T);
        return;
      }

      this.queue.push({ id: taskId, task: wrappedTask });
      this.processQueue();
    });
  }

  private cleanupTask(taskId: string) {
    const timeout = this.taskTimeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.taskTimeouts.delete(taskId);
    }
    this.currentTaskId = null;
    this.isProcessing = false;
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
        this.cleanupTask(nextTask.id);
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
