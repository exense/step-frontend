export class MemoryStorage implements Storage {
  private dataStorage = new Map<string, string>();

  get length(): number {
    return this.dataStorage.size;
  }

  clear(): void {
    this.dataStorage.clear();
  }

  getItem(key: string): string | null {
    return this.dataStorage.get(key) ?? null;
  }

  key(index: number): string | null {
    return null;
  }

  removeItem(key: string): void {
    this.dataStorage.delete(key);
  }

  setItem(key: string, value: string): void {
    this.dataStorage.set(key, value);
  }
}
