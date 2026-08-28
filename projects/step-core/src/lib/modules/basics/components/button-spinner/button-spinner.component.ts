import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StepIconsModule } from '../../../step-icons/step-icons.module';

@Component({
  selector: 'step-button-spinner',
  imports: [StepIconsModule],
  template: '<step-icon name="step-refresh" [attr.aria-label]="label()" />',
  styleUrl: './button-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'diameter()',
    '[style.height.px]': 'diameter()',
  },
})
export class ButtonSpinnerComponent {
  readonly diameter = input(20);
  readonly label = input('Loading');
}
