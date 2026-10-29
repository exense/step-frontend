import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TimeSeriesErrorEntry } from '@exense/step-core';
import { ErrorSearchAction } from '../../shared/error-search-action';

@Component({
  selector: 'step-alt-execution-errors-widget',
  templateUrl: './alt-execution-errors-widget.component.html',
  styleUrl: './alt-execution-errors-widget.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionErrorsWidgetComponent {
  readonly errors = input.required<TimeSeriesErrorEntry[]>();
  readonly searchActions = input<readonly ErrorSearchAction[] | undefined>();
  readonly showDetailsAvailable = input(true);
  readonly showDetails = output<void>();
  readonly searchFor = output<string>();

  protected readonly hasErrors = computed(() => this.errors().length > 0);

  protected readonly singleError = computed(() => {
    const errors = this.errors();
    return errors.length === 1 ? errors[0] : undefined;
  });

  protected readonly failedCount = computed(() => {
    const errors = this.errors();
    return errors.reduce((res, error) => res + error.count, 0);
  });

  protected readonly singleOccurrenceError = computed(() => {
    const singleError = this.singleError();
    const failedCount = this.failedCount();
    return failedCount === 1 ? singleError : undefined;
  });

  protected readonly resolvedSearchActions = computed<readonly ErrorSearchAction[]>(() => {
    const searchActions = this.searchActions();
    return (
      searchActions ?? [
        {
          id: 'tree',
          label: 'Find error in tree',
          icon: 'tree',
          isAvailable: () => true,
          activate: (error) => this.findInTree(error.errorMessage),
        },
      ]
    );
  });

  protected readonly treeSearchAction = computed(() => {
    const actions = this.resolvedSearchActions();
    return actions.find((action) => action.id === 'tree' && action.isAvailable());
  });

  protected activateSearchAction(action: ErrorSearchAction, error: TimeSeriesErrorEntry): void {
    if (!action.isAvailable()) {
      return;
    }
    action.activate(error);
  }

  protected findInTree(message: string): void {
    this.searchFor.emit(message);
  }
}
