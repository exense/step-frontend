import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DisplayAlertType = 'success' | 'warning' | 'error';

@Component({
  selector: 'step-display-alert',
  templateUrl: './display-alert.component.html',
  styleUrls: ['./display-alert.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayAlertComponent {
  readonly type = input<DisplayAlertType>('error');
  readonly title = input<string>();

  protected readonly iconByType: Record<DisplayAlertType, string> = {
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'alert-circle',
  };
}
