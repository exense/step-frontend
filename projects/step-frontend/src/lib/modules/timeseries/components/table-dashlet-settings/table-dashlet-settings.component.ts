import { Component, HostListener, inject, OnInit, viewChild } from '@angular/core';
import {
  ColumnSelection,
  DashboardItem,
  ErrorMessageHandlerService,
  MetricAttribute,
  MetricType,
  Tab,
  TimeSeriesService,
  TwoStageAggregation,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  PipelineAggregationService,
  TimeSeriesContext,
} from '../../modules/_common';
import { FilterBarItemComponent } from '../../modules/filter-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  PIPELINE_GROUP_AGGREGATION_OPTIONS,
  PIPELINE_TIME_AGGREGATION_OPTIONS,
} from '../../modules/_common/types/pipeline-aggregation';

export interface ChartDashletSettingsData {
  item: DashboardItem;
  context: TimeSeriesContext;
}

export type AggregationMode = 'SINGLE' | 'TWO_STAGE';

@Component({
  selector: 'step-table-dashlet-settings',
  templateUrl: './table-dashlet-settings.component.html',
  styleUrls: ['./table-dashlet-settings.component.scss'],
  imports: [COMMON_IMPORTS, FilterBarItemComponent],
})
export class TableDashletSettingsComponent implements OnInit {
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _timeSeriesService = inject(TimeSeriesService);
  private _errorMessageHandler = inject(ErrorMessageHandlerService);
  private _pipelineAggregationService = inject(PipelineAggregationService);

  allAttributes: MetricAttribute[] = [];
  _attributesByKey: Record<string, MetricAttribute> = {};

  private readonly formContainer = viewChild.required<NgForm>('formContainer');

  readonly FilterBarItemType = FilterBarItemType;

  readonly PIPELINE_TIME_AGGREGATION_OPTIONS = PIPELINE_TIME_AGGREGATION_OPTIONS;
  readonly PIPELINE_GROUP_AGGREGATION_OPTIONS = PIPELINE_GROUP_AGGREGATION_OPTIONS;

  readonly AGGREGATION_MODES: Tab<AggregationMode>[] = [
    { id: 'SINGLE', label: 'Single' },
    { id: 'TWO_STAGE', label: 'Two-stage' },
  ];

  item!: DashboardItem;
  filterItems: FilterBarItem[] = [];
  metricTypes: MetricType[] = [];

  aggregationMode: AggregationMode = 'SINGLE';
  twoStageAggregation: TwoStageAggregation = {
    timeAggregation: 'AVG',
    groupAggregation: 'SUM',
  };

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.item.attributes.forEach((attr) => (this._attributesByKey[attr.name] = attr));
    this.filterItems = this.item.filters.map((item) => {
      return FilterUtils.convertApiFilterItem(item);
    });
    this.fetchMetricTypes();
    this.allAttributes = this._inputData.context
      .getAllAttributes()
      .sort((a1, a2) => (a1.displayName > a2.displayName ? 1 : -1));
    this.initAggregationMode();
  }

  private initAggregationMode(): void {
    const twoStageAggregation = this._pipelineAggregationService.getTwoStageAggregation(
      this.item.tableSettings!.aggregation,
    );
    if (twoStageAggregation) {
      this.aggregationMode = 'TWO_STAGE';
      this.twoStageAggregation = { ...twoStageAggregation };
    }
  }

  private fetchMetricTypes(): void {
    this._timeSeriesService.getMetricTypes().subscribe((metrics) => (this.metricTypes = metrics));
  }

  addFilterItem(attribute: MetricAttribute): void {
    this.filterItems.push(FilterUtils.createFilterItemFromAttribute(attribute));
  }

  addCustomFilter(type: FilterBarItemType): void {
    this.filterItems.push({
      attributeName: '',
      type: type,
      label: '',
      exactMatch: false,
      removable: true,
      searchEntities: [],
    });
  }

  onColumnPclValueChange(column: ColumnSelection, value: string): void {
    const aggregateParams = column.aggregation.params || {};
    const oldValue = aggregateParams['pclValue'];
    let parsedNumber: number = parseFloat(value);
    const validPclValue = !isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 100;
    if (validPclValue) {
      aggregateParams['pclValue'] = parsedNumber;
    } else {
      aggregateParams['pclValue'] = 0;
      setTimeout(() => (aggregateParams['pclValue'] = oldValue), 100);
    }
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.formContainer().invalid) {
      this.formContainer().form.markAllAsTouched();
      return;
    }
    this.applyAggregationMode();
    this.item.filters = this.filterItems.filter(FilterUtils.filterItemIsValid).map(FilterUtils.convertToApiFilterItem);
    this.item.attributes = this.item.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close(this.item);
  }

  private applyAggregationMode(): void {
    this.item.tableSettings!.aggregation =
      this.aggregationMode === 'TWO_STAGE'
        ? this._pipelineAggregationService.createTwoStageAggregation(this.twoStageAggregation)
        : undefined;
  }

  handleFilterChange(index: number, item: FilterBarItem): void {
    this.filterItems[index] = item;
    if (!item.attributeName) {
      return;
    }
    const existingItems = this.filterItems.filter((i) => i.attributeName === item.attributeName);
    if (existingItems.length > 1) {
      // the filter is duplicated
      this._errorMessageHandler.showError('Filter not applied');
      this.filterItems.splice(index, 1);
      return;
    }
  }
}
