import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { NotificationAction } from '../../shared/toast-action.interface';

@Component({
  selector: 'step-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent implements OnInit {
  toasts: { message: string; actions?: NotificationAction[]; duration?: number }[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastMessages.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }
}
