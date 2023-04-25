import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {debounceTime, Observable, Subject, take} from 'rxjs';
import { TimeSeriesContext } from '../../time-series-context';
import { FilterUtils } from '../../util/filter-utils';
import { PerformanceViewSettings } from '../model/performance-view-settings';
import { PerformanceViewTimeSelectionComponent } from '../time-selection/performance-view-time-selection.component';
import { FilterBarItemComponent } from './item/filter-bar-item.component';
import { FilterBarItemType, TsFilterItem } from './model/ts-filter-item';
import {TsFilteringSettings} from '../../model/ts-filtering-settings';
import {TimeSeriesConfig} from '../../time-series.config';
import {TimeSeriesService} from '@exense/step-core';
import {OqlVerifyResponse} from '../../model/oql-verify-response';
import {TsFilteringMode} from '../../model/ts-filtering-mode';

@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;
  @Input() performanceViewSettings!: PerformanceViewSettings;
  @Input() defaultFilterOptions: TsFilterItem[] = [];
  @Input() hiddenFilters: TsFilterItem[] = [];

  @Output() onFiltersChange = new EventEmitter<TsFilterItem[]>();
  @Output() onFilterSettingsChange = new EventEmitter<TsFilteringSettings>();
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelection?: PerformanceViewTimeSelectionComponent;

  @ViewChildren(FilterBarItemComponent) filterComponents?: QueryList<FilterBarItemComponent>;
  @ViewChildren('appliedFilter', { read: ElementRef }) appliedFilters?: QueryList<ElementRef<HTMLElement>>;

  private emitFilterChange$ = new Subject<void>();

  readonly EMIT_DEBOUNCE_TIME = 300;
  readonly FilterBarItemType = FilterBarItemType;

  visibleFilters: TsFilterItem[] = [];
  groupDimensions: string[] = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS[0].attributes;

  rawMeasurementsModeActive = false;

  oqlModeActive = false;
  oqlValue: string = '';
  invalidOql = false;

  constructor(private _changeDetectorRef: ChangeDetectorRef, private timeSeriesService: TimeSeriesService) {}

  getFilters() {
    return this.visibleFilters;
  }

  prepareVisibleFilters() {
    const predefinedFiltersById = new Map<string, TsFilterItem>();
    this.hiddenFilters?.forEach((item) => {
      predefinedFiltersById.set(item.attributeName, item);
    });
    const combinedFilters = this.defaultFilterOptions.map((option) => {
      return predefinedFiltersById.get(option.attributeName) || option;
    });

    this.visibleFilters = combinedFilters;
  }

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
    this.prepareVisibleFilters();
    this.emitFilterChange$.pipe(debounceTime(this.EMIT_DEBOUNCE_TIME)).subscribe(() => {
      const filters = this.visibleFilters.filter(FilterUtils.filterItemIsValid);
      if (filters.length) {
        this.composeAndVerifyFullOql().subscribe((response) => {
          this.rawMeasurementsModeActive = response.hasUnknownFields;
          if (!this.rawMeasurementsModeActive) {
            this.emitFiltersChange();
          }
        });
      } else {
        this.emitFiltersChange(); // immediate effect because there are no filters
        this.composeAndVerifyFullOql().subscribe((response) => {
          this.rawMeasurementsModeActive = response.hasUnknownFields;
        });
      }
    });
  }

  handleOqlChange(event: any) {
    this.invalidOql = false;
  }

  toggleOQLMode() {
    if (this.oqlModeActive) {
      const contextualOql = FilterUtils.objectToOQL(this.performanceViewSettings.contextualFilters);
      const customOql = FilterUtils.filtersToOQL(
        this.getFilters().filter(FilterUtils.filterItemIsValid),
        TimeSeriesConfig.ATTRIBUTES_PREFIX
      );
      this.oqlValue = customOql;
    } else {
      this.invalidOql = false;
    }
  }

  disableOqlMode() {
    this.oqlModeActive = false;
  }

  composeAndVerifyFullOql(): Observable<OqlVerifyResponse> {
    // we fake group dimensions as being filters, to verify altogether
    const filtersOql = this.oqlModeActive
      ? this.oqlValue
      : FilterUtils.filtersToOQL(
          this.visibleFilters.filter(FilterUtils.filterItemIsValid),
          TimeSeriesConfig.ATTRIBUTES_PREFIX
        );
    let groupingItems: TsFilterItem[] = this.groupDimensions.map((dimension) => ({
      attributeName: dimension,
      type: FilterBarItemType.FREE_TEXT,
      textValue: 'group-dimension',
      label: '',
    }));
    const groupingOql = FilterUtils.filtersToOQL(groupingItems, TimeSeriesConfig.ATTRIBUTES_PREFIX) || '';
    const finalOql: string = filtersOql ? `(${groupingOql}) and ${filtersOql}` : groupingOql;
    return this.timeSeriesService.verifyOql(finalOql);
  }

  handleGroupingChange(dimensions: string[]) {
    this.groupDimensions = dimensions;
    const filters = this.visibleFilters.filter(FilterUtils.filterItemIsValid);
    this.composeAndVerifyFullOql().subscribe((response) => {
      this.rawMeasurementsModeActive = response.hasUnknownFields;
      // for grouping change, we will trigger refresh automatically. otherwise grouping and filters will change together
      this.onGroupingChange.emit(dimensions);
    });
  }

  emitFiltersChange() {
    const settings: TsFilteringSettings = {
      mode: this.oqlModeActive ? TsFilteringMode.OQL : TsFilteringMode.STANDARD,
      baseFilters: this.context.getBaseFilters(),
      filterItems: this.getFilters().filter(FilterUtils.filterItemIsValid),
      oql: this.oqlValue,
    };
    this.onFilterSettingsChange.emit(settings);
  }

  manuallyApplyFilters() {
    if (!this.oqlModeActive) {
      this.emitFiltersChange();
    } else {
      // oql mode
      let oql = this.oqlValue;
      this.timeSeriesService.verifyOql(oql).subscribe((response) => {
        this.invalidOql = !response.valid;
        if (response.valid && response.hasUnknownFields) {
        }
        if (response.valid) {
          this.emitFiltersChange();
        } else {
          this.invalidOql = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.emitFilterChange$.complete();
    this.onFiltersChange.complete();
  }

  handleFilterChange() {
    this.emitFilterChange$.next();
  }

  addFilterItem(item: TsFilterItem) {
    const filterIndex = this.visibleFilters.findIndex((i) => i.attributeName === item.attributeName);

    if (filterIndex !== -1) {
      const index =
        filterIndex < this.visibleFilters.length - this.visibleFilters.length
          ? filterIndex
          : filterIndex + this.visibleFilters.length;

      this.filterComponents!.toArray()[index].menuTrigger!.openMenu();
    } else {
      this.addFilter(JSON.parse(JSON.stringify(item)));
    }
  }

  addCustomFilter(type: FilterBarItemType) {
    this.addFilter({
      attributeName: '',
      type: type,
      label: '',
      removable: true,
    });
  }

  removeFilterItem(index: number) {
    let itemToDelete = this.visibleFilters[index];

    this.visibleFilters.splice(index, 1);

    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  private addFilter(item: TsFilterItem): void {
    this.visibleFilters.push(item);
    this._changeDetectorRef.detectChanges();
    this.filterComponents!.last.openMenu();
    this.filterComponents!.last.menuTrigger!.menuClosed.pipe(take(1)).subscribe(() => {
      if (!this.filterComponents!.last.changesApplied) {
        this.visibleFilters.pop();
      }
    });
  }
}
