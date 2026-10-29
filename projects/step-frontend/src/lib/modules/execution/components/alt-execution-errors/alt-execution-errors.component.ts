import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
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
import { ErrorSearchAction } from '../../shared/error-search-action';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly searchActions = input<readonly ErrorSearchAction[] | undefined>();
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

  protected readonly resolvedSearchActions = computed(() => {
    const searchActions = this.searchActions();
    const hasTestCases = this.hasTestCases();
    if (searchActions !== undefined) {
      return searchActions;
    }

    const actions: ErrorSearchAction[] = [
      {
        id: 'tree',
        label: 'Find error in tree',
        icon: 'tree',
        isAvailable: () => true,
        activate: (error) => this.findInTree(error.errorMessage),
      },
      {
        id: 'steps',
        label: 'Find error in Steps',
        icon: 'list',
        isAvailable: () => true,
        activate: (error) => this.findInKeywords(error.errorMessage),
      },
    ];
    if (!hasTestCases) {
      return actions;
    }
    actions.push({
      id: 'testCases',
      label: 'Find error in Test Cases',
      icon: 'plan-testcase',
      isAvailable: () => this.hasTestCases(),
      activate: (error) => this.findInTestCases(error.errorMessage),
    });
    return actions;
  });

  protected activateSearchAction(action: ErrorSearchAction, error: TimeSeriesErrorEntry): void {
    if (!action.isAvailable()) {
      return;
    }
    action.activate(error);
  }

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
