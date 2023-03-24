import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { STORAGE } from '../shared/storage.token';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService implements Storage {
  private readonly persistenceTokenPrefix = 'PERSISTENCE_';

  private _renderer: Renderer2;

  constructor(
    @Inject(STORAGE) private _storage: Storage,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this._renderer = this.rendererFactory.createRenderer(null, null);
    this.initBeforeUnloadListener();
  }

  /**
   * @implements Storage
   */
  get length(): number {
    return this._storage.length;
  }

  clear(): void {
    this._storage.clear();
  }

  /**
   * @implements Storage
   */
  getItem(key: string): string | null {
    return this._storage.getItem(this.prefix(key));
  }

  /**
   * @implements Storage
   */
  key(index: number): string | null {
    return this._storage.key(index);
  }

  /**
   * @implements Storage
   */
  removeItem(key: string): void {
    this._storage.removeItem(this.prefix(key));
  }

  /**
   * @implements Storage
   */
  setItem(key: string, value: string): void {
    this._storage.setItem(this.prefix(key), value);
  }

  private prefix(key: string): string {
    return `${this.persistenceTokenPrefix}${key}`;
  }

  private initBeforeUnloadListener(): void {
    this._renderer.listen(this._document.defaultView, 'beforeunload', () => {
      this.clearPersistenceTokens();
    });
  }

  private clearPersistenceTokens(): void {
    Object.keys(this._storage)
      .filter((key) => key.startsWith(this.persistenceTokenPrefix))
      .forEach((key) => {
        this._storage.removeItem(key);
      });
  }
}
