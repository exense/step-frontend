import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { DashboardItem, MetricAttribute, MetricType, TimeSeriesService } from '@exense/step-core';
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

import { MatSnackBar } from '@angular/material/snack-bar';

export interface ChartDashletSettingsData {
  item: DashboardItem;
  context: TimeSeriesContext;
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
  private _snackbar = inject(MatSnackBar);

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
  allAttributes: MetricAttribute[] = [];

  tableDashlets: DashboardItem[] = [];
  masterDashlet?: DashboardItem;

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
        colorizationType: 'STROKE',
      };
    }
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
      this._snackbar.open('Filter not applied', 'dismiss');
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
    this.item.filters = this.filterItems.filter(FilterUtils.filterItemIsValid).map(FilterUtils.convertToApiFilterItem);
    this.item.attributes = this.item.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close({ ...this.item });
  }

  switchAggregate(aggregate: ChartAggregation) {
    this.item.chartSettings!.primaryAxes.aggregation = aggregate;
  }
}
