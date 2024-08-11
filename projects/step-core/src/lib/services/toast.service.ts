import { Injectable, signal } from '@angular/core';
import { NotificationAction } from '../shared/toast-action.interface';
import { ToastType } from '../shared/toast-type.enum';
import { Entity } from '../modules/entity/types/entity';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsInternal = signal<
    {
      type: ToastType;
      message: string;
      values: string[];
      entity?: Entity;
      entityName?: string;
      actions?: NotificationAction[];
      autoClose?: boolean;
      duration?: number;
    }[]
  >([]);
  readonly toastMessages = this.toastsInternal.asReadonly();

  showToast(
    type: ToastType,
    message: string,
    values: string[],
    entity?: Entity,
    entityName?: string,
    actions: NotificationAction[] = [],
    autoClose: boolean = true,
    duration: number = 3000,
  ): void {
    this.toastsInternal.update((toasts) =>
      toasts.concat({ type, message, values, entity, entityName, actions, autoClose, duration }),
    );
  }

  removeToast(message: string): void {
    this.toastsInternal.update((toasts) => toasts.filter((toast) => toast.message !== message));
  }
}
