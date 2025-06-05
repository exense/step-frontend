import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { MenuEntry } from '../types/menu-entry';
import { Reloadable, GlobalReloadService } from '../../basics/step-basics.module';

export type MenuEntryParams = Partial<Pick<MenuEntry, 'icon' | 'weight' | 'isCleanupOnReload'>>;

@Injectable({
  providedIn: 'root',
})
export class CustomMenuEntriesService implements OnDestroy, Reloadable {
  private _globalReloadService = inject(GlobalReloadService);

  private registeredIds = new Set<string>();

  private addEntryInternal$ = new Subject<string>();
  private removeEntryInternal$ = new Subject<string>();

  private customMenuEntries = signal<MenuEntry[]>([]);

  readonly customMenuEntries$ = toObservable(this.customMenuEntries);
  readonly addEntry$ = this.addEntryInternal$.asObservable();
  readonly removeEntry$ = this.removeEntryInternal$.asObservable();

  constructor() {
    this._globalReloadService.register(this);
  }

  ngOnDestroy(): void {
    this.addEntryInternal$.complete();
    this.removeEntryInternal$.complete();
    this._globalReloadService.unRegister(this);
  }

  reload(): void {
    const itemsToRemove = this.customMenuEntries()
      .filter((item) => item.isCleanupOnReload)
      .map((item) => item.id);
    itemsToRemove.forEach((id) => {
      this.registeredIds.delete(id);
      this.removeEntryInternal$.next(id);
    });
    this.customMenuEntries.update((items) => items.filter((item) => !item.isCleanupOnReload));
  }

  add(parentId: string, id: string, title: string, params: MenuEntryParams = {}): void {
    if (this.registeredIds.has(id)) {
      return;
    }

    const item: MenuEntry = {
      parentId,
      id,
      title,
      weight: params?.weight,
      icon: params?.icon!,
      isCleanupOnReload: params?.isCleanupOnReload,
      isCustom: true,
      isEnabledFct: () => true,
    };

    this.registeredIds.add(id);
    this.addEntryInternal$.next(id);
    this.customMenuEntries.update((items) => [...items, item]);
  }

  remove(id: string): void {
    if (!this.registeredIds.has(id)) {
      return;
    }
    this.registeredIds.delete(id);
    this.removeEntryInternal$.next(id);
    this.customMenuEntries.update((items) => items.filter((item) => item.id !== id));
  }

  has(id: string): boolean {
    return this.registeredIds.has(id);
  }
}
