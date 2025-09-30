import { Component, computed, input, output } from '@angular/core';
import { TimeSeriesErrorEntry } from '@exense/step-core';
import { Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-alt-execution-errors-widget',
  templateUrl: './alt-execution-errors-widget.component.html',
  styleUrl: './alt-execution-errors-widget.component.scss',
  standalone: false,
})
export class AltExecutionErrorsWidgetComponent {
  readonly errors = input.required<TimeSeriesErrorEntry[]>();
  readonly showDetails = output<void>();

  protected readonly hasErrors = computed(() => this.errors().length > 0);

  protected readonly singleError = computed(() => {
    const errors = this.errors();
    return errors.length === 1 ? errors[0] : undefined;
  });

  protected readonly singleErrorCount = computed(() => {
    const singleError = this.singleError();
    if (!singleError) {
      return undefined;
    }
    const status = singleError?.types?.[0] ?? Status.FAILED;
    return { [status]: singleError.count };
  });

  protected readonly totalErrorsCount = computed(() => {
    const errors = this.errors();
    const total = errors.reduce((res, error) => res + error.count, 0);
    return { [Status.FAILED]: total };
  });
}
