import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import {
  AxesSettings,
  DashboardItem,
  ErrorMessageHandlerService,
  MetricAggregation,
  MetricAttribute,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesContext,
} from '../../modules/_common';
import { FilterBarItemComponent } from '../../modules/filter-bar';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import {
  AggregationPipeline,
  PipelineAggregation,
  PipelineAggregationUtils,
} from '../../modules/_common/types/pipeline-aggregation';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  AggregateParams,
  TimeseriesAggregatePickerComponent,
} from '../../modules/_common/components/aggregate-picker/timeseries-aggregate-picker.component';

export interface ChartDashletSettingsData {
  item: DashboardItem;
  context: TimeSeriesContext;
}

export type AggregationMode = 'STANDARD' | 'CUSTOM';

interface PipelineAggregationOption {
  value: PipelineAggregation;
  label: string;
}

@Component({
  selector: 'step-chart-dashlet-settings',
  templateUrl: './chart-dashlet-settings.component.html',
  styleUrls: ['./chart-dashlet-settings.component.scss'],
  imports: [COMMON_IMPORTS, FilterBarItemComponent, TimeseriesAggregatePickerComponent],
})
export class ChartDashletSettingsComponent implements OnInit {
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _errorMessageHandler = inject(ErrorMessageHandlerService);

  readonly ChartAggregation = ChartAggregation;

  _attributesByKey: Record<string, MetricAttribute> = {};

  @ViewChild('primaryAggregateMenuTrigger') primaryAggregateMenuTrigger?: MatMenuTrigger;
  @ViewChild('secondaryAggregateMenuTrigger') secondaryAggregateMenuTrigger?: MatMenuTrigger;
  @ViewChild('formContainer', { static: true })
  private formContainer!: NgForm;

  readonly FilterBarItemType = FilterBarItemType;

  readonly PIPELINE_AGGREGATION_OPTIONS: PipelineAggregationOption[] = [
    { value: PipelineAggregation.AVG, label: 'Average' },
    { value: PipelineAggregation.SUM, label: 'Sum' },
    { value: PipelineAggregation.COUNT, label: 'Count' },
    { value: PipelineAggregation.MIN, label: 'Min' },
    { value: PipelineAggregation.MAX, label: 'Max' },
  ];

  readonly AGGREGATION_LABELS: Record<string, string> = {
    SUM: 'Sum',
    AVG: 'Average',
    MAX: 'Max',
    MIN: 'Min',
    COUNT: 'Count',
    RATE: 'Rate',
    MEDIAN: 'Median',
    PERCENTILE: 'Percentile',
  };

  item!: DashboardItem;
  filterItems: FilterBarItem[] = [];
  allAttributes: MetricAttribute[] = [];

  tableDashlets: DashboardItem[] = [];
  masterDashlet?: DashboardItem;

  primaryAggregationMode: AggregationMode = 'STANDARD';
  primaryPipeline: AggregationPipeline = {
    timeAggregation: PipelineAggregation.AVG,
    groupAggregation: PipelineAggregation.SUM,
  };
  secondaryAggregationMode: AggregationMode = 'STANDARD';
  secondaryPipeline: AggregationPipeline = {
    timeAggregation: PipelineAggregation.AVG,
    groupAggregation: PipelineAggregation.SUM,
  };
  showSecondaryAxes = false;
  private stashedSecondaryAxes?: AxesSettings;

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.tableDashlets = this._inputData.context.getDashlets().filter((i) => i.type === 'TABLE');
    if (this.item.masterChartId) {
      this.masterDashlet = this.tableDashlets.find((d) => d.id === this.item.masterChartId);
    }
    this.item.attributes.forEach((attr) => (this._attributesByKey[attr.name] = attr));
    this.filterItems = this.item.filters.map((item) => {
      return FilterUtils.convertApiFilterItem(item);
    });
    this.allAttributes = this._inputData.context
      .getAllAttributes()
      .sort((a1, a2) => (a1.displayName > a2.displayName ? 1 : -1));
    this.initAggregationModes();
  }

  private initAggregationModes(): void {
    const primaryPipeline = PipelineAggregationUtils.getCustomPipeline(
      this.item.chartSettings!.primaryAxes.aggregation,
    );
    if (primaryPipeline) {
      this.primaryAggregationMode = 'CUSTOM';
      this.primaryPipeline = primaryPipeline;
    }
    const secondaryAxes = this.item.chartSettings!.secondaryAxes;
    this.showSecondaryAxes = !!secondaryAxes;
    const secondaryPipeline = PipelineAggregationUtils.getCustomPipeline(secondaryAxes?.aggregation);
    if (secondaryPipeline) {
      this.secondaryAggregationMode = 'CUSTOM';
      this.secondaryPipeline = secondaryPipeline;
    }
  }

  handleShowSecondaryAxesChange(show: boolean): void {
    this.showSecondaryAxes = show;
    const chartSettings = this.item.chartSettings!;
    if (show) {
      chartSettings.secondaryAxes = this.stashedSecondaryAxes ?? this.createDefaultSecondaryAxes();
    } else {
      this.stashedSecondaryAxes = chartSettings.secondaryAxes;
      chartSettings.secondaryAxes = undefined;
    }
  }

  private createDefaultSecondaryAxes(): AxesSettings {
    const aggregation: MetricAggregation =
      this.secondaryAggregationMode === 'CUSTOM'
        ? PipelineAggregationUtils.createCustomPipelineAggregation(this.secondaryPipeline)
        : { type: 'SUM' };
    return {
      aggregation,
      displayType: 'BAR_CHART',
      colorizationType: 'FILL',
      unit: '',
    };
  }

  addFilterItem(attribute: MetricAttribute) {
    this.filterItems.push(FilterUtils.createFilterItemFromAttribute(attribute));
  }

  handleFilterItemChange(index: number, item: FilterBarItem) {
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

  addCustomFilter(type: FilterBarItemType) {
    this.filterItems.push({
      attributeName: '',
      type: type,
      label: '',
      exactMatch: false,
      removable: true,
      searchEntities: [],
    });
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.formContainer.invalid) {
      this.formContainer.form.markAllAsTouched();
      return;
    }
    this.applyAggregationModes();
    this.item.filters = this.filterItems.filter(FilterUtils.filterItemIsValid).map(FilterUtils.convertToApiFilterItem);
    this.item.attributes = this.item.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close({ ...this.item });
  }

  private applyAggregationModes(): void {
    const chartSettings = this.item.chartSettings!;
    if (this.primaryAggregationMode === 'CUSTOM') {
      chartSettings.primaryAxes.aggregation = PipelineAggregationUtils.createCustomPipelineAggregation(
        this.primaryPipeline,
      );
    } else {
      chartSettings.primaryAxes.aggregation = PipelineAggregationUtils.createStandardAggregation(
        chartSettings.primaryAxes.aggregation,
      );
    }
    const secondaryAxes = chartSettings.secondaryAxes;
    if (secondaryAxes) {
      if (this.secondaryAggregationMode === 'CUSTOM') {
        secondaryAxes.aggregation = PipelineAggregationUtils.createCustomPipelineAggregation(this.secondaryPipeline);
      } else {
        secondaryAxes.aggregation = PipelineAggregationUtils.createStandardAggregation(secondaryAxes.aggregation);
      }
    }
  }

  handlePrimaryAggregationChange(change: { aggregate?: ChartAggregation; params?: AggregateParams }) {
    this.item.chartSettings!.primaryAxes.aggregation = {
      type: change.aggregate!,
      params: change.params,
    };
    this.primaryAggregateMenuTrigger?.closeMenu();
  }

  handleSecondaryAggregationChange(change: { aggregate?: ChartAggregation; params?: AggregateParams }) {
    if (!change.aggregate) {
      return;
    }
    this.item.chartSettings!.secondaryAxes!.aggregation = { type: change.aggregate, params: change.params };
    this.secondaryAggregateMenuTrigger?.closeMenu();
  }
}
