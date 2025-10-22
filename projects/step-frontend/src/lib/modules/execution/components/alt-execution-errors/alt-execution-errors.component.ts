import { Component, computed, inject, input } from '@angular/core';
import {
  AceMode,
  AugmentedTimeSeriesService,
  RichEditorDialogService,
  TableDataSource,
  TableIndicatorMode,
  tablePersistenceConfigProvider,
  TableLocalDataSource,
  TableRemoteDataSource,
  TimeSeriesErrorEntry,
} from '@exense/step-core';
import { EXECUTION_ENDED_STATUSES, Status } from '../../../_common/step-common.module';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'step-alt-execution-errors',
  templateUrl: './alt-execution-errors.component.html',
  styleUrl: './alt-execution-errors.component.scss',
  standalone: false,
  providers: [
    tablePersistenceConfigProvider('executionErrors', {
      storePagination: true,
      storeSearch: false,
      storeSort: false,
    }),
  ],
})
export class AltExecutionErrorsComponent {
  private _richEditorDialogs = inject(RichEditorDialogService);
  private _timeSeriesApi = inject(AugmentedTimeSeriesService);

  readonly dataSourceInput = input<
    | TableDataSource<TimeSeriesErrorEntry>
    | TimeSeriesErrorEntry[]
    | Observable<TimeSeriesErrorEntry[] | undefined>
    | undefined
  >(undefined, {
    alias: 'dataSource',
  });

  protected readonly dataSource = computed(() => {
    const data = this.dataSourceInput();
    if (!data) {
      return [] as TimeSeriesErrorEntry[];
    }
    if (data instanceof TableLocalDataSource || data instanceof TableRemoteDataSource) {
      return data;
    }
    if (data instanceof Array) {
      return this._timeSeriesApi.createErrorsLocalDataSource(data);
    }
    const data$ = (data as Observable<TimeSeriesErrorEntry[] | undefined>).pipe(map((items) => items ?? []));
    return this._timeSeriesApi.createErrorsLocalDataSource(data$);
  });

  readonly showExecutionsMenu = input(true);

  readonly statusFilterItems = input(EXECUTION_ENDED_STATUSES, {
    transform: (items?: Status[] | null) => (!items?.length ? EXECUTION_ENDED_STATUSES : items) as Status[],
  });

  protected showError(errorMessage: string): void {
    this._richEditorDialogs.editText(errorMessage, {
      isReadOnly: true,
      title: 'Error message',
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
