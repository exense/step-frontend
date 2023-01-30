import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { RelativeTimeSelection } from './model/relative-time-selection';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeRangePickerSelection } from './time-range-picker-selection';
import { RangeSelectionType } from './model/range-selection-type';
import { ExecutionTimeSelection } from './model/execution-time-selection';
import { TimeSeriesUtils } from '../time-series-utils';

/**
 * When dealing with relative/full selection, this component should not know anything about dates, therefore no date calculations are needed.
 * This is in order to keep this component as simple as possible.
 */
@Component({
  selector: 'step-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
})
export class TimeRangePicker implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Input() customRelativeOptions: RelativeTimeSelection[] | undefined;
  @Input() initialSelectionIndex: number | undefined;
  @Input() includeFullRangeOption: boolean = true;

  @Output() onSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  @Input() activeSelection!: TimeRangePickerSelection;
  @Output() activeSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  _30_MINUTES = 30 * 60 * 1000; // in ms

  defaultRelativeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 minute', timeInMs: this._30_MINUTES / 30 },
    { label: 'Last 5 minutes', timeInMs: this._30_MINUTES / 6 },
    { label: 'Last 15 minutes', timeInMs: this._30_MINUTES / 2 },
    { label: 'Last 30 minutes', timeInMs: this._30_MINUTES },
    { label: 'Last 1 hour', timeInMs: this._30_MINUTES * 2 },
    { label: 'Last 3 hours', timeInMs: this._30_MINUTES * 6 },
  ];

  fromDateString: string | undefined; // used for formatting the date together with time
  toDateString: string | undefined;

  ngOnInit(): void {
    if (this.initialSelectionIndex != undefined) {
      this.activeSelection = {
        type: RangeSelectionType.RELATIVE,
        relativeSelection: (this.customRelativeOptions || this.defaultRelativeOptions)[this.initialSelectionIndex],
      };
    } else {
      if (!this.activeSelection) {
        this.activeSelection = {
          type: RangeSelectionType.RELATIVE,
          relativeSelection: (this.customRelativeOptions || this.defaultRelativeOptions)[0],
        };
      } else {
        if (this.activeSelection.type === RangeSelectionType.ABSOLUTE) {
          let from = this.activeSelection.absoluteSelection!.from!;
          let to = this.activeSelection.absoluteSelection!.to!;
          console.log(this.activeSelection);
          this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(from));
          this.toDateString = TimeSeriesUtils.formatInputDate(new Date(to));
        }
      }
    }
  }

  applyAbsoluteInterval() {
    let from = 0;
    let to = 0;
    if (this.fromDateString && this.isValidDate(this.fromDateString)) {
      from = new Date(this.fromDateString).getTime();
    } else {
      // the date is invalid
      this.fromDateString = undefined;
    }
    if (this.toDateString && this.isValidDate(this.toDateString)) {
      to = new Date(this.toDateString).getTime();
    } else {
      // the date is invalid
      this.toDateString = undefined;
    }
    if (!from && !to) {
      if (this.includeFullRangeOption) {
        this.emitSelectionChange({ type: RangeSelectionType.FULL });
      }
      // else do nothing. maybe show an error
    } else {
      const newSelection = {
        type: RangeSelectionType.ABSOLUTE,
        absoluteSelection: { from: from, to: to },
      };
      if (from !== this.activeSelection.absoluteSelection?.from || to !== this.activeSelection.absoluteSelection?.to) {
        this.emitSelectionChange(newSelection);
      }
    }
    this.closeMenu();
  }

  onRelativeSelectionSelected(option: RelativeTimeSelection) {
    if (
      this.activeSelection.type === RangeSelectionType.RELATIVE &&
      this.activeSelection.relativeSelection!.timeInMs === option.timeInMs
    ) {
      return;
    }
    this.emitSelectionChange({ type: RangeSelectionType.RELATIVE, relativeSelection: option });
  }

  /**
   * This method should be called from the exterior.
   */
  selectFullRange() {
    this.resetCustomDates();
    this.activeSelection = { type: RangeSelectionType.FULL };
  }

  /**
   * This method reacts to the component html selection change, and should NOT be used from exterior
   */
  onFullRangeSelect(): void {
    if (this.activeSelection.type === RangeSelectionType.FULL) {
      return; // nothing changed
    }
    this.emitSelectionChange({ type: RangeSelectionType.FULL });
  }

  /**
   * This should be called from the exterior.
   * @param selection
   */
  setSelection(selection: ExecutionTimeSelection) {
    this.activeSelection = selection;
    if (selection.type === RangeSelectionType.ABSOLUTE) {
      this.setAbsoluteSelection(selection);
    } else if (selection.type === RangeSelectionType.RELATIVE) {
      this.resetCustomDates();
    } else {
      // it is full
      this.resetCustomDates();
    }
  }

  private setAbsoluteSelection(selection: ExecutionTimeSelection) {
    const from = selection.absoluteSelection!.from;
    const to = selection.absoluteSelection!.to;
    this.resetCustomDates();
    if (from) {
      this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(from));
    }
    if (to) {
      this.toDateString = TimeSeriesUtils.formatInputDate(new Date(to));
    }
  }

  emitSelectionChange(selection: TimeRangePickerSelection) {
    this.activeSelection = selection;
    this.onSelectionChange.emit(selection);
  }

  setFromDate(event: MatDatepickerInputEvent<any>) {
    const utcDate = new Date(event.value.ts); // this is 00:00:00 in GMT
    const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0);
    this.fromDateString = TimeSeriesUtils.formatInputDate(localDate);
  }

  setToDate(event: MatDatepickerInputEvent<any>) {
    const utcDate = new Date(event.value.ts);
    const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0);
    this.toDateString = TimeSeriesUtils.formatInputDate(localDate);
  }

  formatTimeValue(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }

  resetCustomDates() {
    this.fromDateString = undefined;
    this.toDateString = undefined;
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  isValidDate(stringValue: string): boolean {
    const dateObject = new Date(stringValue);
    // @ts-ignore
    return dateObject !== 'Invalid Date' && !isNaN(dateObject); // from mozilla+chrome and IE8
  }

  getActiveSelection() {
    return this.activeSelection;
  }

  get RangeSelectionType() {
    return RangeSelectionType;
  }
}
