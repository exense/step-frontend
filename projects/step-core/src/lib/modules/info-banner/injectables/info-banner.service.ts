import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InfoBanner } from '../types/info-banner';
import { stringHash } from '../../basics/types/string-hash';
import { LOCAL_STORAGE } from '../../basics/types/storage.token';

interface StackItem {
  view: string;
  infos: InfoBanner[];
}

const INFO_BANNER_HIDDEN_MESSAGES_KEY = 'info_banner_hidden_messages_key';

@Injectable({
  providedIn: 'root',
})
export class InfoBannerService {
  private _localStorage = inject(LOCAL_STORAGE);

  private data = new Map<string, InfoBanner[]>();
  private registeredIds = new Set<string>();

  private hiddenMessagesIds?: Set<string>;
  private isStorageCleanedUp = false;

  private viewStack = signal<StackItem[]>([]);
  private viewStackTop = computed(() => {
    const viewStack = this.viewStack();
    return viewStack[viewStack.length - 1];
  });

  private actualPath = computed(() => this.viewStackTop()?.view ?? '');
  readonly actualInfos = computed(() => this.viewStackTop()?.infos ?? []);

  register(view: string, bannerText: string, permission?: string): this {
    if (!this.data.has(view)) {
      this.data.set(view, []);
    }
    const id = `${view}:${stringHash(bannerText)}`;
    const info = bannerText;
    this.registeredIds.add(id);
    this.data.get(view)!.push({ id, info, permission });
    return this;
  }

  hasInfo(view: string): boolean {
    return this.data.has(view);
  }

  cleanupDisplayedInfo(): void {
    this.viewStack.update((viewStack) => {
      viewStack.pop();
      return [...viewStack];
    });
  }

  displayInfo(view: string): Observable<boolean> {
    if (!this.isStorageCleanedUp) {
      this.cleanupStorage();
      this.isStorageCleanedUp = true;
    }
    const hiddenMessages = this.getHiddenMessagedIds();
    const infos = (this.data.get(view) ?? []).filter((info) => !hiddenMessages.has(info.id));

    this.viewStack.update((viewStack) => [...viewStack, { view, infos }]);
    return of(true);
  }

  hideInfoInActualView(id: string): void {
    if (!id.startsWith(this.actualPath())) {
      return;
    }
    const hiddenMessagesIds = this.getHiddenMessagedIds();
    hiddenMessagesIds.add(id);
    this.syncWithStorage();
    this.viewStack.update((viewStack) => {
      if (viewStack.length <= 0) {
        return viewStack;
      }
      let lastItem = viewStack.pop()!;
      // Object reference should be also change for proper signal update
      lastItem = {
        view: lastItem.view,
        infos: lastItem.infos.filter((info) => info.id !== id),
      };
      return [...viewStack, lastItem];
    });
  }

  private getHiddenMessagedIds(): Set<string> {
    if (this.hiddenMessagesIds) {
      return this.hiddenMessagesIds;
    }
    const hiddenMessagesStr = this._localStorage.getItem(INFO_BANNER_HIDDEN_MESSAGES_KEY) ?? '[]';
    try {
      this.hiddenMessagesIds = new Set(JSON.parse(hiddenMessagesStr) as string[]);
    } catch (err) {
      this.hiddenMessagesIds = new Set<string>();
    }
    return this.hiddenMessagesIds;
  }

  private syncWithStorage(): void {
    const hiddenMessagesIds = this.getHiddenMessagedIds();
    this._localStorage.setItem(INFO_BANNER_HIDDEN_MESSAGES_KEY, JSON.stringify(Array.from(hiddenMessagesIds)));
  }

  private cleanupStorage(): void {
    const hiddenMessagesIds = this.getHiddenMessagedIds();
    let isModified = false;
    hiddenMessagesIds.forEach((hiddenKey) => {
      if (!this.registeredIds.has(hiddenKey)) {
        hiddenMessagesIds.delete(hiddenKey);
        isModified = true;
      }
    });
    if (isModified) {
      this.syncWithStorage();
    }
  }
}
