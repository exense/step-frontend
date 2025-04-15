import { computed, Injectable, signal } from '@angular/core';
import { ErrorViewItem } from '../types/error-view-item';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ErrorsViewStateService {
  private errorsInternal = signal<ErrorViewItem[]>([]);
  readonly errors = this.errorsInternal.asReadonly();
  readonly count = computed(() => this.errors().length);

  addError(message: string): void {
    const item: ErrorViewItem = { id: v4(), message, isRead: false };
    this.errorsInternal.update((errors) => [item, ...errors]);
  }

  dismissError(id: string): void {
    this.errorsInternal.update((errors) => errors.filter((error) => error.id !== id));
  }

  markAsRead(): void {
    this.errorsInternal.update((errors) => errors.map((error) => ({ ...error, isRead: true })));
  }

  dismissAll(): void {
    {
      this.errorsInternal.set([]);
    }
  }
}
