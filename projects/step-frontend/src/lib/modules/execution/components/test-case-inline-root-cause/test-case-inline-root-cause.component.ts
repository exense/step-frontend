import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AggregatedReportView, StepIconsModule } from '@exense/step-core';

@Component({
  selector: 'step-test-case-inline-root-cause',
  imports: [StepIconsModule],
  templateUrl: './test-case-inline-root-cause.component.html',
  styleUrl: './test-case-inline-root-cause.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCaseInlineRootCauseComponent {
  readonly item = input.required<AggregatedReportView>();

  protected readonly errorCounts = computed(() => {
    const item = this.item();
    let result = 0;
    Object.values(item.countByErrorMessage ?? {}).forEach((count) => (result += count));
    Object.values(item.countByChildrenErrorMessage ?? {}).forEach((count) => (result += count));
    return result;
  });

  protected readonly singleMessage = computed(() => {
    const item = this.item();
    return Object.keys(item.countByErrorMessage ?? [])[0] ?? Object.keys(item.countByChildrenErrorMessage ?? [])[0];
  });
}
