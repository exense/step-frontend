import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StatusComponent {
  readonly status = input<string | undefined>();
  readonly iconMode = input(false);
  protected readonly className = computed(() => {
    const status = this.status();
    return !status ? '' : `status-${status}`;
  });
}
