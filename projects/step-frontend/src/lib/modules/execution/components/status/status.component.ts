import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent {
  readonly status = input<string | undefined>();
  readonly iconMode = input(false);
}
