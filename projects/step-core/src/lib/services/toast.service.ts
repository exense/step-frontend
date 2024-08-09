import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationAction } from '../shared/toast-action.interface';
import { ToastType } from '../shared/toast-type.enum';
import { Entity } from '../modules/entity/types/entity';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<
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
  >();
  toastMessages = this.toastSubject.asObservable();
  private toasts: {
    type: ToastType;
    message: string;
    values: string[];
    entity?: Entity;
    entityName?: string;
    actions?: NotificationAction[];
    autoClose?: boolean;
    duration?: number;
  }[] = [];

  showToast(
    type: ToastType,
    message: string,
    values: string[],
    entity?: Entity,
    entityName?: string,
    actions?: NotificationAction[],
    auto?: boolean,
    duration?: number,
  ): void {
    this.toasts.push({
      type,
      message,
      values,
      entity,
      entityName,
      actions: actions || [],
      autoClose: !!auto,
      duration: duration || 3000,
    });
    this.toastSubject.next(this.toasts);
  }

  removeToast(message: string): void {
    this.toasts = this.toasts.filter((toast) => toast.message !== message);
    this.toastSubject.next(this.toasts);
  }
}
