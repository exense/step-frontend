import { Component, computed, inject, input, output } from '@angular/core';
import {
  AceMode,
  AugmentedTimeSeriesService,
  RichEditorDialogService,
  TableDataSource,
  TableIndicatorMode,
  TableLocalDataSource,
  tablePersistenceConfigProvider,
  TableRemoteDataSource,
  TimeSeriesErrorEntry,
} from '@exense/step-core';
import { EXECUTION_ENDED_STATUSES, Status } from '../../../_common/step-common.module';
import { map, Observable } from 'rxjs';
import { SearchError, SearchErrorType } from '../../shared/search-error';

const ALL_COLUMNS = {
  errorMessage: 'errorMessage',
  errorCode: 'errorCode',
  types: 'types',
  count: 'count',
  percentage: 'percentage',
  actions: 'actions',
};

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
  readonly searchFor = output<SearchError>();

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
  readonly showActions = input(true);
  readonly hasTestCases = input(false);
  readonly indicatorMode = input<TableIndicatorMode>(TableIndicatorMode.SPINNER);
  readonly inProgress = input(false, {
    transform: (value: boolean | null | undefined) => value ?? false,
  });

  readonly statusFilterItems = input(EXECUTION_ENDED_STATUSES, {
    transform: (items?: Status[] | null) => (!items?.length ? EXECUTION_ENDED_STATUSES : items) as Status[],
  });

  protected readonly displayColumns = computed(() => {
    const showActions = this.showActions();
    let columns = Object.values(ALL_COLUMNS);
    if (!showActions) {
      columns = columns.filter((col) => col !== ALL_COLUMNS.actions);
    }
    return columns;
  });

  protected showError(errorMessage: string): void {
    this._richEditorDialogs.editText(errorMessage, {
      isReadOnly: true,
      title: 'Error message',
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }

  protected findInTree(value: string): void {
    this.searchFor.emit({ type: SearchErrorType.TREE, value });
  }

  protected findInTestCases(value: string): void {
    this.searchFor.emit({ type: SearchErrorType.TEST_CASE, value });
  }

  protected findInKeywords(value: string): void {
    this.searchFor.emit({ type: SearchErrorType.KEYWORD, value });
  }
}
