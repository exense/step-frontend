import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { LOCAL_STORAGE } from '../shared/storage.token';
import { StorageProxy } from '../shared/storage-proxy';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService extends StorageProxy {
  private _renderer: Renderer2;

  constructor(
    @Inject(LOCAL_STORAGE) storage: Storage,
    private _rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    super(storage, 'PERSISTENCE');
    this._renderer = this._rendererFactory.createRenderer(null, null);
    this.initBeforeUnloadListener();
  }

  private initBeforeUnloadListener(): void {
    this._renderer.listen(this._document.defaultView, 'beforeunload', () => {
      this.clearTokens();
    });
  }
}
