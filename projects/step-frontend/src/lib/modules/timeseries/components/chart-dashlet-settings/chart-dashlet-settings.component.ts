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
import { TimeseriesAggregatePickerComponent } from '../../modules/_common/components/aggregate-picker/timeseries-aggregate-picker.component';
import { MatMenuTrigger } from '@angular/material/menu';

export interface ChartDashletSettingsData {
  item: DashboardItem;
  context: TimeSeriesContext;
}

@Component({
  selector: 'step-chart-dashlet-settings',
  templateUrl: './chart-dashlet-settings.component.html',
  styleUrls: ['./chart-dashlet-settings.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, FilterBarItemComponent, TimeseriesAggregatePickerComponent],
})
export class ChartDashletSettingsComponent implements OnInit {
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _timeSeriesService = inject(TimeSeriesService);

  readonly ChartAggregation = ChartAggregation;

  _attributesByKey: Record<string, MetricAttribute> = {};

  @ViewChild('primaryAggregateMenuTrigger') primaryAggregateMenuTrigger?: MatMenuTrigger;
  @ViewChild('secondaryAggregateMenuTrigger') secondaryAggregateMenuTrigger?: MatMenuTrigger;
  @ViewChild('formContainer', { static: true })
  private formContainer!: NgForm;

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

  addFilterItem(attribute: MetricAttribute) {
    this.filterItems.push(FilterUtils.createFilterItemFromAttribute(attribute));
  }

  handleFilterItemChange(index: number, item: FilterBarItem) {
    this.filterItems[index] = item;
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

  handlePrimaryAggregationChange(change: { aggregate?: ChartAggregation; pclValue?: number }) {
    this.item.chartSettings!.primaryAxes.aggregation = {
      type: change.aggregate!,
      params: { pclValue: change.pclValue },
    };
    this.primaryAggregateMenuTrigger?.closeMenu();
  }

  handleSecondaryAggregationChange(change: { aggregate?: ChartAggregation; pclValue?: number }) {
    const newAggregate = change.aggregate;
    const newPcl = change.pclValue;
    if (newAggregate) {
      if (!this.item.chartSettings!.secondaryAxes) {
        this.item.chartSettings!.secondaryAxes = {
          aggregation: { type: newAggregate, params: { pclValue: newPcl } },
          displayType: 'BAR_CHART',
          colorizationType: 'STROKE',
          unit: '',
        };
      } else {
        this.item.chartSettings!.secondaryAxes.aggregation = { type: newAggregate, params: { pclValue: newPcl } };
      }
    } else {
      this.item.chartSettings!.secondaryAxes = undefined;
    }
    this.secondaryAggregateMenuTrigger?.closeMenu();
  }
}
