import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { AggregatorType, DashboardItem, MetricAttribute, MetricType, TimeSeriesService } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { COMMON_IMPORTS, FilterBarItem, FilterBarItemType, FilterUtils } from '../../modules/_common';
import { FilterBarItemComponent } from '../../modules/filter-bar';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';

export interface ChartDashletSettingsData {
  item: DashboardItem;
}

@Component({
  selector: 'step-chart-dashlet-settings',
  templateUrl: './chart-dashlet-settings.component.html',
  styleUrls: ['./chart-dashlet-settings.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, FilterBarItemComponent],
})
export class ChartDashletSettingsComponent implements OnInit {
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _timeSeriesService = inject(TimeSeriesService);

  readonly ChartAggregation = ChartAggregation;

  _attributesByKey: Record<string, MetricAttribute> = {};

  @ViewChild('formContainer', { static: true })
  private formContainer!: NgForm;

  readonly AGGREGATE_TYPES: ChartAggregation[] = [
    ChartAggregation.SUM,
    ChartAggregation.AVG,
    ChartAggregation.MAX,
    ChartAggregation.MIN,
    ChartAggregation.COUNT,
    ChartAggregation.RATE,
    ChartAggregation.MEDIAN,
    ChartAggregation.PERCENTILE,
  ];
  readonly PCL_VALUES = [80, 90, 99];
  readonly FilterBarItemType = FilterBarItemType;

  item!: DashboardItem;
  filterItems: FilterBarItem[] = [];
  metricTypes: MetricType[] = [];

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.item.chartSettings!.attributes.forEach((attr) => (this._attributesByKey[attr.name] = attr));
    this.filterItems = this.item.chartSettings!.filters.map((item) => {
      return FilterUtils.convertApiFilterItem(item);
    });
    this.fetchMetricTypes();
  }

  private fetchMetricTypes() {
    this._timeSeriesService.getMetricTypes().subscribe((metrics) => (this.metricTypes = metrics));
  }

  setPclValue(pclValue: number) {
    this.item.chartSettings!.primaryAxes!.pclValue = pclValue;
  }

  onSecondaryAggregateSelect(aggregation: ChartAggregation) {
    if (!aggregation) {
      this.item.chartSettings!.secondaryAxes = undefined;
    } else {
      this.item.chartSettings!.secondaryAxes = {
        aggregation: aggregation,
        unit: '',
        displayType: 'BAR_CHART',
        pclValue: this.PCL_VALUES[0],
      };
    }
  }

  addFilterItem(attribute: MetricAttribute) {
    this.filterItems.push(FilterUtils.createFilterItemFromAttribute(attribute));
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
    this.item.chartSettings!.filters = this.filterItems
      .filter(FilterUtils.filterItemIsValid)
      .map(FilterUtils.convertToApiFilterItem);
    this.item.chartSettings!.attributes = this.item.chartSettings!.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close({ ...this.item });
  }

  switchAggregate(aggregate: ChartAggregation) {
    this.item.chartSettings!.primaryAxes.aggregation = aggregate;
  }
}
