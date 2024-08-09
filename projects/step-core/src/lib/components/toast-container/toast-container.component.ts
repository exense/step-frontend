import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { NotificationAction } from '../../shared/toast-action.interface';
import { ToastType } from '../../shared/toast-type.enum';
import { Entity } from '../../modules/entity/types/entity';

@Component({
  selector: 'step-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent implements OnInit {
  toasts: {
    type: ToastType;
    message: string;
    values: string[];
    entity?: Entity;
    entityName?: string;
    actions?: NotificationAction[];
    autoClose?: boolean;
    duration?: number;
  }[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastMessages.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }
}
