import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { DashboardItem, MetricAttribute } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartDashletSettingsData } from './chart-dashlet-settings-data';
import { FilterBarItemType, FilterBarItem } from '../../../../performance-view/filter-bar/model/filter-bar-item';
import { FilterUtils } from '../../../../util/filter-utils';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'step-chart-dashlet-settings',
  templateUrl: './chart-dashlet-settings.component.html',
  styleUrls: ['./chart-dashlet-settings.component.scss'],
})
export class ChartDashletSettingsComponent implements OnInit {
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);

  _attributesByKey: Record<string, MetricAttribute> = {};

  @ViewChild('formContainer', { static: true })
  private formContainer!: NgForm;

  readonly AGGREGATE_TYPES = ['SUM', 'AVG', 'MAX', 'MIN', 'COUNT', 'RATE', 'MEDIAN', 'PERCENTILE'];
  readonly FilterBarItemType = FilterBarItemType;

  item!: DashboardItem;
  filterItems: FilterBarItem[] = [];

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.item.chartSettings!.attributes.forEach((attr) => (this._attributesByKey[attr.name] = attr));
    this.filterItems = this.item.chartSettings!.filters.map((item) => {
      return FilterUtils.convertApiFilterItem(item);
    });
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
}
