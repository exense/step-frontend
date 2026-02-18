import { Component, computed, input, output } from '@angular/core';
import { StepCommonModule } from '../../../_common/step-common.module';

@Component({
  selector: 'step-table-counts-toggle',
  imports: [StepCommonModule],
  template: `
    <button
      type="button"
      mat-icon-button
      [color]="enabled() ? 'primary' : undefined"
      [matTooltip]="tooltipText()"
      (click)="toggle.emit()"
    >
      <step-icon name="loader" />
    </button>
  `,
  standalone: true,
})
export class TableCountsToggleComponent {
  readonly enabled = input(false);
  readonly itemsLabel = input('items');
  readonly toggle = output<void>();

  protected readonly tooltipText = computed(() => {
    const itemsLabel = this.itemsLabel();
    const isEnabled = this.enabled();
    if (isEnabled) {
      return `Click to disable loading the total number of ${itemsLabel} to enhance performance.`;
    }
    return `Click to load the total number of ${itemsLabel}. Note: this may slow down performance for large numbers of ${itemsLabel}`;
  });
}
