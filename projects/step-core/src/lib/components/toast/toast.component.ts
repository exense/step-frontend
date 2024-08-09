import { Component, inject, Input, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { NotificationAction } from '../../shared/toast-action.interface';
import { ToastType } from '../../shared/toast-type.enum';

@Component({
  selector: 'step-toast',
  templateUrl: 'toast.component.html',
  styleUrls: ['toast.component.scss'],
})
export class ToastComponent implements OnInit {
  @Input() type!: ToastType;
  @Input() message: string = '';
  @Input() actions: NotificationAction[] | undefined = [];
  @Input() duration: number | undefined = 3000;
  @Input() autoClose: boolean = true;
  @Input() values: string[] = [];
  private _toastService = inject(ToastService);
  private timer: any;
  toastType = ToastType;
  messageParts: any[] = [];

  ngOnInit(): void {
    this.formatMessage();
    if (this.autoClose) {
      this.timer = setTimeout(() => this.closeToast(), this.duration || 3000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  closeToast(): void {
    this._toastService.removeToast(this.message);
  }

  private formatMessage(): void {
    const formattedMessage = this.message.replace(/{(\d+)}/g, (match, index) => {
      return `{${index}}`;
    });

    const parts = formattedMessage.split(/(\{\d+\})/g);
    this.messageParts = parts.map((part) => {
      const match = part.match(/\{(\d+)\}/);
      if (match) {
        const index = parseInt(match[1], 10);
        const originalValue = this.values[index];
        const displayValue = this.truncate(originalValue, 50);
        return { isPlaceholder: true, originalValue, displayValue };
      }
      return part;
    });
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }
}
