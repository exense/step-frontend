import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { StatusIconClassDirective } from '../../directives/status-icon-class.directive';

@Component({
  selector: 'step-status-common',
  templateUrl: './status-common.component.html',
  styleUrl: './status-common.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  hostDirectives: [
    {
      directive: StatusIconClassDirective,
      inputs: ['status', 'iconMode', 'classPrefix'],
    },
  ],
})
export class StatusCommonComponent {
  private _statusIconClassDirective = inject(StatusIconClassDirective, { self: true });

  protected readonly status = computed(() => this._statusIconClassDirective.status());
  protected readonly iconMode = computed(() => this._statusIconClassDirective.iconMode());
  protected readonly className = computed(() => this._statusIconClassDirective.className());
}
