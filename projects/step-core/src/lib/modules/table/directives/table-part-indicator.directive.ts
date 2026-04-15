import { computed, Directive, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { TableIndicatorMode } from '../types/table-indicator-mode.enum';
import { EmptyState } from '../shared/empty-state.enum';
import { TablePartDatasourceDirective } from './table-part-datasource.directive';

@Directive({
  selector: '[stepTablePartIndicator]',
  host: {
    '[class.in-progress]': 'applyInProgressClass()',
    '[class.use-skeleton-placeholder]': 'useSkeletonPlaceholder()',
  },
})
export class TablePartIndicatorDirective {
  protected readonly _tableDataSource = inject(TablePartDatasourceDirective);

  readonly indicatorMode = input<TableIndicatorMode>(TableIndicatorMode.SKELETON);

  readonly inProgressExternal = input(false, { alias: 'inProgress' });

  protected readonly useSkeletonPlaceholder = linkedSignal(() => {
    const indicatorMode = this.indicatorMode();
    return indicatorMode == TableIndicatorMode.SKELETON_ON_INITIAL_LOAD || indicatorMode == TableIndicatorMode.SKELETON;
  });

  readonly useSpinner = computed(() => {
    const indicatorMode = this.indicatorMode();
    return indicatorMode === TableIndicatorMode.SPINNER;
  });

  readonly inProgress = computed(() => {
    const inProgressExternal = this.inProgressExternal();
    const inProgressDataSource = this._tableDataSource.inProgressDataSource();
    return inProgressExternal || inProgressDataSource;
  });

  protected readonly applyInProgressClass = computed(() => {
    const inProgress = this.inProgress();
    const emptyState = this._tableDataSource.emptyState();
    return inProgress || emptyState === EmptyState.INITIAL;
  });

  private effectResetSkeletonPlaceholderOnInitialLoad = effect(() => {
    const indicatorMode = this.indicatorMode();
    const emptyState = this._tableDataSource.emptyState();
    if (indicatorMode == TableIndicatorMode.SKELETON_ON_INITIAL_LOAD && emptyState !== EmptyState.INITIAL) {
      setTimeout(() => {
        this.useSkeletonPlaceholder.set(false);
      }, 500);
    }
  });
}
