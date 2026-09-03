import { Injectable, inject, signal, type Signal, type WritableSignal } from '@angular/core';
import { catchError, concatMap, from, Observable, of, tap } from 'rxjs';
import { AugmentedResourcesService, type ResourcePreview } from '../../../client/step-client-module';

const PREVIEW_REQUEST_DELAY_MS = 25;
const PREVIEW_REQUEST_CHUNK_SIZE = 50;
const PREVIEW_CACHE_MAX_SIZE = 500;
const PREVIEW_NUMBER_OF_LINES = 8;

@Injectable({
  providedIn: 'root',
})
export class AttachmentPreviewContentService {
  private _resourceService = inject(AugmentedResourcesService);

  private requestedIds = new Set<string>();
  private queuedIds = new Set<string>();
  private previewContentSignals = new Map<string, WritableSignal<string | undefined>>();
  private cacheOrder: string[] = [];
  private flushHandle?: ReturnType<typeof setTimeout>;

  requestTextPreviews(resourceIds: string[]): void {
    const idsToQueue = [...new Set(resourceIds)].filter((id) => !!id && !this.requestedIds.has(id));
    if (!idsToQueue.length) {
      return;
    }

    for (const id of idsToQueue) {
      this.ensurePreviewContentSignal(id);
      this.requestedIds.add(id);
      this.queuedIds.add(id);
    }
    this.scheduleFlush();
  }

  getPreviewContent(resourceId: string): Signal<string | undefined> {
    return this.ensurePreviewContentSignal(resourceId);
  }

  private scheduleFlush(): void {
    if (this.flushHandle) {
      return;
    }
    this.flushHandle = setTimeout(() => this.flush(), PREVIEW_REQUEST_DELAY_MS);
  }

  private flush(): void {
    this.flushHandle = undefined;
    const ids = Array.from(this.queuedIds);
    this.queuedIds.clear();
    if (!ids.length) {
      return;
    }

    const chunks = this.chunk(ids);
    from(chunks)
      .pipe(concatMap((chunk) => this.loadPreviewChunk(chunk)))
      .subscribe();
  }

  private loadPreviewChunk(ids: string[]): Observable<ResourcePreview[]> {
    return this._resourceService.getBulkPreviewContent(ids, PREVIEW_NUMBER_OF_LINES).pipe(
      tap((previews) => {
        for (const preview of previews) {
          this.setPreviewContent(preview.resourceId!, preview.success ? preview.content : undefined);
        }
      }),
      catchError(() => {
        for (const id of ids) {
          this.requestedIds.delete(id);
        }
        return of([]);
      }),
    );
  }

  private chunk(ids: string[]): string[][] {
    const result: string[][] = [];
    for (let index = 0; index < ids.length; index += PREVIEW_REQUEST_CHUNK_SIZE) {
      result.push(ids.slice(index, index + PREVIEW_REQUEST_CHUNK_SIZE));
    }
    return result;
  }

  private setPreviewContent(resourceId: string, content: string | undefined): void {
    this.ensurePreviewContentSignal(resourceId).set(content);
    this.touchCacheEntry(resourceId);
  }

  private ensurePreviewContentSignal(resourceId: string): WritableSignal<string | undefined> {
    let contentSignal = this.previewContentSignals.get(resourceId);
    if (!contentSignal) {
      contentSignal = signal<string | undefined>(undefined);
      this.previewContentSignals.set(resourceId, contentSignal);
    }
    this.touchCacheEntry(resourceId);
    return contentSignal;
  }

  private touchCacheEntry(resourceId: string): void {
    const existingIndex = this.cacheOrder.indexOf(resourceId);
    if (existingIndex !== -1) {
      this.cacheOrder.splice(existingIndex, 1);
    }
    this.cacheOrder.push(resourceId);
    this.pruneCache();
  }

  private pruneCache(): void {
    while (this.cacheOrder.length > PREVIEW_CACHE_MAX_SIZE) {
      const resourceId = this.cacheOrder.shift();
      if (!resourceId) {
        continue;
      }
      this.previewContentSignals.delete(resourceId);
      this.requestedIds.delete(resourceId);
    }
  }
}
