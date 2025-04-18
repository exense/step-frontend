import { Injectable } from '@angular/core';
import { Reloadable } from '../types/reloadable';

@Injectable({
  providedIn: 'root',
})
export class GlobalReloadService {
  private items = new Set<Reloadable>();

  reloadData(): void {
    this.items.forEach((item) => item.reload());
  }

  register(reloadable: Reloadable): void {
    this.items.add(reloadable);
  }

  unRegister(reloadable: Reloadable): void {
    this.items.delete(reloadable);
  }
}
