import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'step-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent {
  protected readonly _toasts = inject(ToastService).toastMessages;
}
