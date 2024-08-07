import { Component, inject, Input, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { NotificationAction } from '../../shared/toast-action.interface';

@Component({
  selector: 'step-toast',
  templateUrl: 'toast.component.html',
  styleUrls: ['toast.component.scss'],
})
export class ToastComponent implements OnInit {
  @Input() message: string = '';
  @Input() actions: NotificationAction[] | undefined = [];
  @Input() duration: number | undefined = 3000;
  private _toastService = inject(ToastService);
  private timer: any;

  ngOnInit(): void {
    this.timer = setTimeout(() => this.closeToast(), this.duration || 3000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  closeToast(): void {
    this._toastService.removeToast(this.message);
  }
}
