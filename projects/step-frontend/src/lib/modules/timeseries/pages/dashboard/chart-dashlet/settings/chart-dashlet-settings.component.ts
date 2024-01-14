import { Component, inject, OnInit } from '@angular/core';
import { AxesSettings, ChartFilterItem, ChartSettings, DashboardItem, MetricAttribute, Plan } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartDashletSettingsData } from './chart-dashlet-settings-data';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterBarItemType, TsFilterItem } from '../../../../performance-view/filter-bar/model/ts-filter-item';
import { FilterUtils } from '../../../../util/filter-utils';

export type ChartForm = FormGroup<{
  name: FormControl<string | null>;
  chartSettings: ChartSettingsForm;
  size: FormControl<number | null>;
}>;

export type ChartSettingsForm = FormGroup<{
  metricKey: FormControl<string | null>;
  attributes: FormControl<Array<MetricAttribute> | null>;
  primaryAxes: FormControl<AxesSettings | null>;
  filters: FormControl<Array<ChartFilterItem> | null>;
  grouping: FormControl<Array<string> | null>;
  inheritGlobalFilters: FormControl<boolean | null>;
  inheritGlobalGrouping: FormControl<boolean | null>;
  readonlyGrouping: FormControl<boolean | null>;
  readonlyAggregate: FormControl<boolean | null>;
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
  newAttributeInputValue = '';
  filterItems: TsFilterItem[] = [];

  ngOnInit(): void {
    this.item = JSON.parse(JSON.stringify(this._inputData.item));
    this.formGroup = this.createFormGroup(this._formBuilder, this.item);
    this.filterItems = this.item.chartSettings!.filters.map((item) => ({
      type: item.type,
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

  addAttribute(): void {
    this.item.chartSettings!.attributes.push({ name: '', displayName: '' });
  }

  private createFormGroup(fb: FormBuilder, item: DashboardItem): ChartForm {
    return fb.group({
      name: fb.control(item.name, [Validators.required]),
      chartSettings: item.chartSettings ? this.createChartSettingsGroup(fb, item.chartSettings) : null,
      size: fb.control(item.size, [Validators.required, Validators.min(1)]),
    }) as unknown as ChartForm;
  }

  private createChartSettingsGroup(fb: FormBuilder, settings: ChartSettings): ChartSettingsForm {
    return fb.group({
      metricKey: fb.control(settings.metricKey, [Validators.required]),
      attributes: fb.control(settings.attributes, [Validators.required]),
      primaryAxes: fb.control(settings.primaryAxes, [Validators.required]),
      filters: fb.control(settings.filters, [Validators.required]),
      grouping: fb.control(settings.grouping, [Validators.required]),
      inheritGlobalFilters: fb.control(settings.inheritGlobalFilters, [Validators.required]),
      inheritGlobalGrouping: fb.control(settings.inheritGlobalGrouping, [Validators.required]),
      readonlyGrouping: fb.control(settings.readonlyGrouping, [Validators.required]),
      readonlyAggregate: fb.control(settings.readonlyAggregate, [Validators.required]),
    }) as ChartSettingsForm;
  }

  submitForm() {
    this.item.chartSettings!.filters = this.filterItems
      .filter(FilterUtils.filterItemIsValid)
      .map(FilterUtils.convertToApiFilterItem);
    this.item.chartSettings!.attributes = this.item.chartSettings!.attributes.filter((a) => a.name && a.displayName); // keep only non null attributes
    this._dialogRef.close({ ...this.item });
  }
}
