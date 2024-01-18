import { Component, inject, OnInit } from '@angular/core';
import { DashboardItem } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartDashletSettingsData } from './chart-dashlet-settings-data';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterBarItemType, FilterBarItem } from '../../../../performance-view/filter-bar/model/filter-bar-item';
import { FilterUtils } from '../../../../util/filter-utils';
import { ChartSettingsForm, createChartSettingsGroup } from './chart-settings.form';

export type ChartForm = FormGroup<{
  name: FormControl<string | null>;
  chartSettings: ChartSettingsForm;
  size: FormControl<number | null>;
}>;

@Component({
  selector: 'step-chart-dashlet-settings',
  templateUrl: './chart-dashlet-settings.component.html',
  styleUrls: ['./chart-dashlet-settings.component.scss'],
})
export class ChartDashletSettingsComponent implements OnInit {
  readonly AGGREGATE_TYPES = ['SUM', 'AVG', 'MAX', 'MIN', 'COUNT', 'RATE', 'MEDIAN', 'PERCENTILE'];
  private _inputData: ChartDashletSettingsData = inject<ChartDashletSettingsData>(MAT_DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
  private _dialogRef = inject(MatDialogRef);
  formGroup!: ChartForm;

  item!: DashboardItem;
  filterItems: FilterBarItem[] = [];

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.formGroup = this.createFormGroup(this.item);
    this.filterItems = this.item.chartSettings!.filters.map((item) => ({
      type: item.type as FilterBarItemType,
      attributeName: item.attribute,
      searchEntities: [],
      freeTextValues: item.textValues,
    }));
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

  private createFormGroup(item: DashboardItem): ChartForm {
    return this._formBuilder.group({
      name: this._formBuilder.control(item.name, [Validators.required]),
      chartSettings: item.chartSettings ? createChartSettingsGroup(this._formBuilder, item.chartSettings) : null,
      size: this._formBuilder.control(item.size, [Validators.required, Validators.min(1)]),
    }) as unknown as ChartForm;
  }

  submitForm() {
    this.item.chartSettings!.filters = this.filterItems
      .filter(FilterUtils.filterItemIsValid)
      .map(FilterUtils.convertToApiFilterItem);
    this.item.chartSettings!.attributes = this.item.chartSettings!.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close({ ...this.item });
  }

  get FilterBarItemType() {
    return FilterBarItemType;
  }
}
