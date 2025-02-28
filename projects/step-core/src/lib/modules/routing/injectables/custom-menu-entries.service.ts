import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { MenuEntry } from '../types/menu-entry';

@Injectable({
  providedIn: 'root',
})
export class CustomMenuEntriesService implements OnDestroy {
  private registeredIds = new Set<string>();

  private addEntryInternal$ = new Subject<string>();
  private removeEntryInternal$ = new Subject<string>();

  private customMenuEntries = signal<MenuEntry[]>([]);

  readonly customMenuEntries$ = toObservable(this.customMenuEntries);
  readonly addEntry$ = this.addEntryInternal$.asObservable();
  readonly removeEntry$ = this.removeEntryInternal$.asObservable();

  ngOnDestroy(): void {
    this.addEntryInternal$.complete();
    this.removeEntryInternal$.complete();
  }

  add(parentId: string, id: string, title: string, params: Partial<Pick<MenuEntry, 'icon' | 'weight'>> = {}): void {
    if (this.registeredIds.has(id)) {
      return;
    }

    const item: MenuEntry = {
      parentId,
      id,
      title,
      weight: params?.weight,
      icon: params?.icon!,
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
