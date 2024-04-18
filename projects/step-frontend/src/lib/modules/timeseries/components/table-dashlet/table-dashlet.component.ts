import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesUtilityService,
} from '../../modules/_common';
import { ChartSkeletonComponent, TSChartSeries } from '../../modules/chart';
import {
  BucketAttributes,
  BucketResponse,
  DashboardItem,
  Execution,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  MarkerType,
  MetricAttribute,
  Plan,
  TableDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TableSettings,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { TsComparePercentagePipe } from '../../modules/legacy/pipes/ts-compare-percentage.pipe';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { BehaviorSubject, forkJoin, Observable, tap } from 'rxjs';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { MatDialog } from '@angular/material/dialog';
import { TableDashletSettingsComponent } from '../table-dashlet-settings/table-dashlet-settings.component';
import { TableEntryFormatPipe } from './table-entry-format.pipe';

export interface TableEntry {
  name: string; // series id
  groupingLabels: string[]; // each grouping attribute will have a label
  base?: BucketResponse;
  compare?: BucketResponse;
  color: string;
  isSelected?: boolean;
  countDiff?: number;
  sumDiff?: number;
  avgDiff?: number;
  minDiff?: number;
  maxDiff?: number;
  pcl80Diff?: number;
  pcl90Diff?: number;
  pcl99Diff?: number;
  tpsDiff?: number;
  tphDiff?: number;
}

@Component({
  selector: 'step-table-dashlet',
  templateUrl: './table-dashlet.component.html',
  styleUrls: ['./table-dashlet.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TsComparePercentagePipe, TableEntryFormatPipe],
})
export class TableDashletComponent extends ChartDashlet implements OnInit, OnChanges {
  @Input() item!: DashboardItem;
  @Input() context!: TimeSeriesContext;
  @Input() editMode = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  private _timeSeriesService = inject(TimeSeriesService);
  private _matDialog = inject(MatDialog);
  private _timeSeriesUtilityService = inject(TimeSeriesUtilityService);

  tableData$ = new BehaviorSubject<TableEntry[]>([]);
  tableDataSource: TableLocalDataSource<TableEntry> | undefined;
  tableIsLoading = true;

  settings!: TableSettings;

  columnsDefinition: TableColumn[] = [];
  visibleColumnsIds: string[] = ['name'];
  attributesByIds: Record<string, MetricAttribute> = {};

  allSeriesChecked: boolean = true;

  readonly MarkerType = MarkerType;
  readonly TableColumnType = TableColumnType;

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Dashlet item cannot be undefined');
    }
    this.prepareState(this.item);
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.fetchDataAndCreateTable().subscribe();
  }

  private prepareState(item: DashboardItem) {
    item.attributes?.forEach((attr) => (this.attributesByIds[attr.name] = attr));
    this.columnsDefinition = item.tableSettings!.columns!.map((column) => {
      return {
        id: column.column!,
        label: ColumnsLabels[column.column],
        isVisible: column.selected,
        isCompareColumn: false,
        mapValue: ColumnsValueFunctions[column.column!],
      } as TableColumn;
    });
    this.collectVisibleColumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItem = changes['item'];
    if (cItem?.previousValue !== cItem?.currentValue && !cItem?.firstChange) {
      this.prepareState(this.item);
      this.refresh(true).subscribe();
    }
  }

  collectVisibleColumns(): void {
    let visibleColumns = this.columnsDefinition.filter((col) => col.isVisible).map((col) => col.id);
    this.visibleColumnsIds = ['name', ...visibleColumns];
  }

  onColumnVisibilityChange(column: TableColumn): void {
    const newVisible = !column.isVisible;
    // update the chart settings
    this.settings.columns.filter((c) => c.column === column.id).forEach((c) => (c.selected = newVisible));
  }

  private getGroupDimensions(): string[] {
    return this.item.inheritGlobalGrouping ? this.context.getGroupDimensions() : this.item.grouping;
  }

  private fetchDataAndCreateTable(): Observable<TimeSeriesAPIResponse> {
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: this.getGroupDimensions(),
      oqlFilter: FilterUtils.filtersToOQL(this.getFilterItems(), 'attributes'),
      numberOfBuckets: 1,
      percentiles: [80, 90, 99],
    };
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createTable(response);
      }),
    );
  }

  private getFilterItems(): FilterBarItem[] {
    const metricItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.item.metricKey}"`],
      searchEntities: [],
    };
    let filterItems = [];
    if (this.item.inheritGlobalFilters) {
      filterItems = FilterUtils.combineGlobalWithChartFilters(
        this.context.getFilteringSettings().filterItems,
        this.item.filters,
      );
    } else {
      filterItems = this.item.filters.map(FilterUtils.convertApiFilterItem);
    }

    filterItems.push(metricItem);
    return filterItems;
  }

  refresh(blur?: boolean): Observable<any> {
    return this.fetchDataAndCreateTable();
  }

  private createTable(response: TimeSeriesAPIResponse) {
    const syncGroup = this.context.getSyncGroup(this.item.id);
    const data: TableEntry[] = [];
    response.matrix.forEach((series, i) => {
      if (series.length != 1) {
        // we should have just one bucket
        throw new Error('Something went wrong');
      }
      const seriesAttributes = response.matrixKeys[i];
      const bucket = series[0];
      bucket.attributes = seriesAttributes;
      const groupingLabels = this.getGroupDimensions().map((field) => seriesAttributes[field]);
      const seriesKey = this.mergeLabelItems(groupingLabels);
      bucket.attributes['_id'] = groupingLabels;
      bucket.attributes['avg'] = (bucket.sum / bucket.count).toFixed(0);
      bucket.attributes['tps'] = Math.trunc(bucket.count / ((response.end! - response.start!) / 1000));
      bucket.attributes['tph'] = Math.trunc((bucket.count / ((response.end! - response.start!) / 1000)) * 3600);
      data.push({
        name: seriesKey,
        groupingLabels: groupingLabels,
        base: series[0],
        color: this.context.getColor(seriesKey),
        isSelected: syncGroup.seriesShouldBeVisible(seriesKey),
      });
    });
    this.tableData$.next(data);
    this.fetchLegendEntities(data).subscribe(() => this.tableDataSource?.reload());
    this.tableIsLoading = false;
  }

  onAllSeriesCheckboxClick(checked: boolean) {
    this.context.getSyncGroup(this.item.id).setAllSeriesChecked(checked);

    this.tableData$.getValue().forEach((entry) => {
      entry.isSelected = checked;
    });
  }

  onKeywordToggle(entry: TableEntry, selected: boolean) {
    let syncGroup = this.context.getSyncGroup(this.item.id);
    if (selected) {
      syncGroup.showSeries(entry.name);
    } else {
      this.allSeriesChecked = false;
      syncGroup.hideSeries(entry.name);
    }
  }

  openSettings(): void {
    this._matDialog
      .open(TableDashletSettingsComponent, { data: { item: this.item, context: this.context } })
      .afterClosed()
      .subscribe((updatedItem: DashboardItem) => {
        if (updatedItem) {
          Object.assign(this.item, updatedItem);
          this.prepareState(this.item);
          this.refresh(true).subscribe();
        }
      });
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      // there was no grouping
      return TimeSeriesConfig.SERIES_LABEL_VALUE;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  hideSeries(key: string): void {}

  showSeries(key: string): void {}

  private fetchLegendEntities(data: TableEntry[]): Observable<any> {
    const groupDimensions = this.getGroupDimensions();
    const requests$ = groupDimensions
      .map((attributeKey, i) => {
        const attribute = this.attributesByIds[attributeKey];
        const entityName = attribute?.metadata['entity'];
        if (!entityName) {
          return undefined;
        }
        const entityIds = new Set<string>(data.map((entry) => entry.groupingLabels[i]).filter((v) => !!v));
        return this._timeSeriesUtilityService.getEntitiesNamesByIds(Array.from(entityIds.values()), entityName).pipe(
          tap((response) => {
            data.forEach((entry, j) => {
              const labelId = entry.groupingLabels[i];
              if (labelId) {
                if (response[labelId]) {
                  entry.groupingLabels[i] = response[labelId];
                } else {
                  entry.groupingLabels[i] = labelId + ' (unresolved)';
                }
                data[j] = { ...entry };
              }
            });
          }),
        );
      })
      .filter((x) => !!x);
    return forkJoin(requests$);
  }

  getDatasourceConfig(): TableLocalDataSourceConfig<TableEntry> {
    return TableLocalDataSource.configBuilder<TableEntry>()
      .addSortStringPredicate('name', (item) => item.base?.attributes['name'])
      .addSortNumberPredicate('COUNT', (item) => item.base?.count)
      .addSortNumberPredicate('COUNT_comp', (item) => item.compare?.count)
      .addSortNumberPredicate('COUNT_diff', (item) => item.countDiff)
      .addSortNumberPredicate('SUM', (item) => item.base?.sum)
      .addSortNumberPredicate('SUM_comp', (item) => item.compare?.sum)
      .addSortNumberPredicate('SUM_diff', (item) => item.sumDiff)
      .addSortNumberPredicate('AVG', (item) => item.base?.attributes['avg'])
      .addSortNumberPredicate('AVG_comp', (item) => item.compare?.attributes['avg'])
      .addSortNumberPredicate('AVG_diff', (item) => item.avgDiff)
      .addSortNumberPredicate('MIN', (item) => item.base?.min)
      .addSortNumberPredicate('MIN_comp', (item) => item.compare?.min)
      .addSortNumberPredicate('MIN_diff', (item) => item.minDiff)
      .addSortNumberPredicate('MAX', (item) => item.base?.max)
      .addSortNumberPredicate('MAX_comp', (item) => item.compare?.max)
      .addSortNumberPredicate('MAX_diff', (item) => item.maxDiff)
      .addSortNumberPredicate('PCL_80', (item) => item.base?.pclValues?.[80])
      .addSortNumberPredicate('PCL_80_comp', (item) => item.compare?.pclValues?.[80])
      .addSortNumberPredicate('PCL_80_diff', (item) => item.pcl80Diff)
      .addSortNumberPredicate('PCL_90', (item) => item.base?.pclValues?.[90])
      .addSortNumberPredicate('PCL_90_comp', (item) => item.compare?.pclValues?.[90])
      .addSortNumberPredicate('PCL_90_diff', (item) => item.pcl90Diff)
      .addSortNumberPredicate('PCL_99', (item) => item.base?.pclValues?.[99])
      .addSortNumberPredicate('PCL_99_comp', (item) => item.compare?.pclValues?.[99])
      .addSortNumberPredicate('PCL_99_diff', (item) => item.pcl99Diff)
      .addSortNumberPredicate('TPS', (item) => item.base?.attributes['tps'])
      .addSortNumberPredicate('TPS_comp', (item) => item.compare?.attributes['tps'])
      .addSortNumberPredicate('TPS_diff', (item) => item.tpsDiff)
      .addSortNumberPredicate('TPH', (item) => item.base?.attributes['tph'])
      .addSortNumberPredicate('TPH_comp', (item) => item.compare?.attributes['tph'])
      .addSortNumberPredicate('TPH_diff', (item) => item.tphDiff)
      .build();
  }
}

interface TableColumn {
  id: string;
  // type: TableColumnType;
  label: string;
  subLabel?: string;
  mapValue: (bucket: BucketResponse) => any;
  // mapDiffValue: (entry: TableEntry) => number | undefined;
  isCompareColumn: boolean;
  isVisible: boolean;
}

const ColumnsValueFunctions = {
  [TableColumnType.COUNT]: (b: BucketResponse) => b?.count,
  [TableColumnType.SUM]: (b: BucketResponse) => b?.sum,
  [TableColumnType.AVG]: (b: BucketResponse) => b?.attributes?.['avg'],
  [TableColumnType.MIN]: (b: BucketResponse) => b?.min,
  [TableColumnType.MAX]: (b: BucketResponse) => b?.max,
  [TableColumnType.PCL_80]: (b: BucketResponse) => b?.pclValues?.[80],
  [TableColumnType.PCL_90]: (b: BucketResponse) => b?.pclValues?.[90],
  [TableColumnType.PCL_99]: (b: BucketResponse) => b?.pclValues?.[99],
  [TableColumnType.TPS]: (b: BucketResponse) => b?.attributes?.['tps'],
  [TableColumnType.TPH]: (b: BucketResponse) => b?.attributes?.['tph'],
};

const ColumnsLabels = {
  [TableColumnType.COUNT]: 'Count',
  [TableColumnType.SUM]: 'Sum',
  [TableColumnType.AVG]: 'Avg',
  [TableColumnType.MIN]: 'Min',
  [TableColumnType.MAX]: 'Max',
  [TableColumnType.PCL_80]: 'Pcl. 80 (ms)',
  [TableColumnType.PCL_90]: 'Pcl. 90 (ms)',
  [TableColumnType.PCL_99]: 'Pcl. 99 (ms)',
  [TableColumnType.TPS]: 'Tps',
  [TableColumnType.TPH]: 'Tph',
};
