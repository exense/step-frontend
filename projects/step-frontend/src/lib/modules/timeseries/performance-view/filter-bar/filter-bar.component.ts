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
import { debounceTime, Observable, Subject, take } from 'rxjs';
import { TimeSeriesContext } from '../../time-series-context';
import { FilterUtils } from '../../util/filter-utils';
import { PerformanceViewSettings } from '../model/performance-view-settings';
import { PerformanceViewTimeSelectionComponent } from '../time-selection/performance-view-time-selection.component';
import { FilterBarItemComponent } from './item/filter-bar-item.component';
import { FilterBarItemType, TsFilterItem } from './model/ts-filter-item';
import { TimeSeriesService } from '../../time-series.service';
import { OqlVerifyResponse } from '../../model/oql-verify-response';

@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;
  @Input() performanceViewSettings!: PerformanceViewSettings;
  @Input() defaultFilterOptions: TsFilterItem[] = [];
  @Input() activeFilters: TsFilterItem[] = [];

  @Output() onFiltersChange = new EventEmitter<TsFilterItem[]>();
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelection?: PerformanceViewTimeSelectionComponent;

  @ViewChildren(FilterBarItemComponent) filterComponents?: QueryList<FilterBarItemComponent>;
  @ViewChildren('appliedFilter', { read: ElementRef }) appliedFilters?: QueryList<ElementRef<HTMLElement>>;

  private emitFilterChange$ = new Subject<void>();

  readonly EMIT_DEBOUNCE_TIME = 300;
  readonly FilterBarItemType = FilterBarItemType;

  filters: TsFilterItem[] = [];
  moreFilters: TsFilterItem[] = [];

  rawMeasurementsModeActive = false;
  showApplyButton = false;

  constructor(private _changeDetectorRef: ChangeDetectorRef, private timeSeriesService: TimeSeriesService) {}

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
    this.filters = this.activeFilters;
    this.emitFilterChange$.pipe(debounceTime(this.EMIT_DEBOUNCE_TIME)).subscribe(() => {
      const filters = this.filters.filter(FilterUtils.filterItemIsValid);
      if (filters.length) {
        this.showApplyButton = true;
        this.composeAndVerifyOql(filters).subscribe((response) => {
          this.rawMeasurementsModeActive = response.hasUnknownFields;
          this.showApplyButton = response.hasUnknownFields;
          if (!this.rawMeasurementsModeActive) {
            this.emitFiltersChange();
          }
        });
      } else {
        this.showApplyButton = false;
        this.emitFiltersChange(); // immediate effect because there are no filters
        this.composeAndVerifyOql(filters).subscribe((response) => {
          this.rawMeasurementsModeActive = response.hasUnknownFields;
        });
      }
    });
  }

  composeAndVerifyOql(filters: TsFilterItem[]): Observable<OqlVerifyResponse> {
    // we fake group dimensions as being filters, to verify altogether
    let attributesPrefix = 'attributes';
    this.context
      .getGroupDimensions()
      .forEach((dimension) =>
        filters.push({
          attributeName: dimension,
          type: FilterBarItemType.FREE_TEXT,
          textValue: 'group-dimension',
          label: '',
        })
      );
    const oql = FilterUtils.filtersToOQL(filters, attributesPrefix);
    return this.timeSeriesService.verifyOql(oql);
  }

  handleGroupingChange(dimensions: string[]) {
    this.onGroupingChange.emit(dimensions);
    const filters = this.filters.filter(FilterUtils.filterItemIsValid);
    this.composeAndVerifyOql(filters).subscribe((response) => {
      this.rawMeasurementsModeActive = response.hasUnknownFields;
    });
  }

  emitFiltersChange() {
    this.showApplyButton = false;
    const filters = this.filters.filter(FilterUtils.filterItemIsValid);
    this.onFiltersChange.emit(filters);
  }

  ngOnDestroy(): void {
    this.emitFilterChange$.complete();
    this.onFiltersChange.complete();
  }

  handleFilterChange() {
    this.emitFilterChange$.next();
  }

  addFilterItem(item: TsFilterItem) {
    const filterIndex = this.filters.findIndex((i) => i.attributeName === item.attributeName);

    if (filterIndex !== -1) {
      const index =
        filterIndex < this.filters.length - this.moreFilters.length
          ? filterIndex
          : filterIndex + this.moreFilters.length;

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
    });
  }

  removeFilterItem(index: number) {
    let itemToDelete = this.filters[index];

    this.filters.splice(index, 1);

    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  initMoreFilters(): void {
    if (!this.appliedFilters) {
      return;
    }

    const orderedTops = this.appliedFilters
      .map((appliedFilter) => {
        const { top } = appliedFilter.nativeElement.getBoundingClientRect();

        return top;
      })
      .sort((a, b) => a - b);

    const sameLevelFilters = this.appliedFilters.filter((appliedFilter) => {
      const { top } = appliedFilter.nativeElement.getBoundingClientRect();

      return top === orderedTops[0];
    });

    this.moreFilters = this.filters.slice(sameLevelFilters.length);
  }

  private addFilter(item: TsFilterItem): void {
    this.filters.push(item);
    this._changeDetectorRef.detectChanges();
    this.initMoreFilters();
    this._changeDetectorRef.detectChanges();
    this.filterComponents!.last.menuTrigger!.openMenu();
    this.filterComponents!.last.menuTrigger!.menuClosed.pipe(take(1)).subscribe(() => {
      if (!this.filterComponents!.last.changesApplied) {
        this.filters.pop();
      }
    });

    setTimeout(() => {
      this.filterComponents!.last.initialFocus!.nativeElement.focus();
    });
  }
}
