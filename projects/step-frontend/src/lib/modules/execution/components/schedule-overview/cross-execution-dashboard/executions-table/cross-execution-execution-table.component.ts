import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  DateFormat,
  DateRange,
  DateRangeFilterCondition,
  Execution,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  REQUEST_FILTERS_INTERCEPTORS,
  SearchValue,
  selectionCollectionProvider,
  StepDataSource,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../../../services/execution-list-filter-interceptor.service';
import { TimeSeriesEntityService } from '../../../../../timeseries/modules/_common';
import { EXECUTION_STATUS_TREE, Status } from '../../../../../_common/shared/status.enum';

@Component({
  selector: 'step-cross-execution-executions-table',
  templateUrl: './cross-execution-execution-table.component.html',
  styleUrls: ['./cross-execution-execution-table.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionParameters.customParameters',
    }),
    tablePersistenceConfigProvider('crossExecutionList', {
      storePagination: false,
      storeSort: false,
      storeSearch: false,
    }),
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: REQUEST_FILTERS_INTERCEPTORS,
      useClass: ExecutionListFilterInterceptorService,
      multi: true,
    },
    FilterConditionFactoryService,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CrossExecutionExecutionTableComponent implements OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  dataSource: StepDataSource<Execution> | undefined;
  readonly DateFormat = DateFormat;

  hiddenFilters = input<Record<string, string | string[] | SearchValue>>();
  defaultDateRange = input<DateRange>();

  reloadEffect = effect(() => {
    console.log('effect');
    const filters = this.hiddenFilters();
    const range = this.defaultDateRange();
    const combinedFilters: Record<string, SearchValue> = {
      startTime: new DateRangeFilterCondition({ range: range }),
      ...filters,
    };
    if (range) {
      this.dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource(combinedFilters);
    }
  });

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  refreshTable(): void {
    this.dataSource!.reload({ hideProgress: true });
    this.reloadRunningExecutionsCount$.next();
  }
}
