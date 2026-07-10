import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'step-button-spinner',
  imports: [MatProgressSpinner],
  template: '<mat-spinner [diameter]="diameter()" [attr.aria-label]="label()" />',
  styleUrl: './button-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonSpinnerComponent {
  readonly diameter = input(18);
  readonly label = input('Loading');
}
