export abstract class StorageProxy implements Storage {
  protected constructor(
    private storage: Storage,
    private storagePrefix: string,
  ) {}

  get length(): number {
    return this.storage.length;
  }

  clear(): void {
    this.storage.clear();
  }

  getItem(key: string): string | null {
    return this.storage.getItem(this.prefix(key));
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }

  removeItem(key: string): void {
    this.storage.removeItem(this.prefix(key));
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(this.prefix(key), value);
  }

  private prefix(key: string): string {
    return `${this.storagePrefix}_${key}`;
  }

  clearTokens(query?: RegExp): void {
    Object.keys(this.storage)
      .filter((key) => key.startsWith(this.storagePrefix) && (!query || query.test(key)))
      .forEach((key) => {
        this.storage.removeItem(key);
      });
  }
}
