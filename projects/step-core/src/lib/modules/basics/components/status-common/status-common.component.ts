import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-status-common',
  templateUrl: './status-common.component.html',
  styleUrl: './status-common.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCommonComponent {
  /** @Input() **/
  status = input<string | undefined>(undefined);

  /** @Input() **/
  classPrefix = input<string>('step');

  readonly className = computed(() => `${this.classPrefix()}-${this.status()}`);
}
