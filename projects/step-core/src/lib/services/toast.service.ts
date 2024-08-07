import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationAction } from '../shared/toast-action.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<{ message: string; actions?: NotificationAction[]; duration?: number }[]>();
  toastMessages = this.toastSubject.asObservable();
  private toasts: { message: string; actions: NotificationAction[]; duration: number }[] = [];

  showToast(message: string, actions?: NotificationAction[], duration?: number): void {
    this.toasts.push({ message, actions: actions || [], duration: duration || 3000 });
    this.toastSubject.next(this.toasts);
  }

  removeToast(message: string): void {
    this.toasts = this.toasts.filter((toast) => toast.message !== message);
    this.toastSubject.next(this.toasts);
  }
}
