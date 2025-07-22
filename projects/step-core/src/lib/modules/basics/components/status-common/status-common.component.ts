import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-status-common',
  templateUrl: './status-common.component.html',
  styleUrl: './status-common.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StatusCommonComponent {
  /** @Input() **/
  readonly status = input<string | undefined>(undefined);

  /** @Input() **/
  readonly classPrefix = input<string>('step');

  /** @Input() **/
  readonly iconMode = input(false);

  protected readonly className = computed(() => {
    const prefix = this.classPrefix();
    const iconMode = this.iconMode();
    const status = this.status();

    return [prefix, iconMode ? 'icon' : '', status].filter((part) => !!part).join('-');
  });
}
