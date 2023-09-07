import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeRangePickerSelection } from './time-range-picker-selection';
import { RangeSelectionType } from './model/range-selection-type';
import { ExecutionTimeSelection } from './model/execution-time-selection';
import { TimeSeriesUtils } from '../time-series-utils';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * When dealing with relative/full selection, this component should not know anything about dates, therefore no date calculations are needed.
 * This is in order to keep this component as simple as possible.
 */
@Component({
  selector: 'step-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
})
export class TimeRangePickerComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Input() activeSelection!: TimeRangePickerSelection;
  @Input() selectOptions!: TimeRangePickerSelection[];
  @Input() initialSelectionIndex: number | undefined;
  @Input() includeFullRangeOption: boolean = true;
  @Input() compact = false;

  @Output() onSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  @Output() activeSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  fromDateString: string | undefined; // used for formatting the date together with time
  toDateString: string | undefined;

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if (!this.selectOptions) {
      throw new Error('Options param is mandatory');
    }
    if (this.initialSelectionIndex != undefined) {
      this.activeSelection = this.selectOptions[0];
    } else {
      if (!this.activeSelection) {
        this.activeSelection = this.selectOptions[0];
      } else {
        if (this.activeSelection.type === RangeSelectionType.ABSOLUTE) {
          let from = this.activeSelection.absoluteSelection!.from!;
          let to = this.activeSelection.absoluteSelection!.to!;
          this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(from));
          this.toDateString = TimeSeriesUtils.formatInputDate(new Date(to));
        }
      }
    }
  }

  getOptions(): TimeRangePickerSelection[] {
    return this.selectOptions;
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
      // both are missing
      if (this.includeFullRangeOption) {
        this.emitSelectionChange({ type: RangeSelectionType.FULL });
        this.closeMenu();
      } else {
        this._snackBar.open('Time range not applied', 'dismiss');
      }
    }
    if (!from) {
      this._snackBar.open('From selection is required', 'dismiss');
      return;
    }
    if (!to) {
      // to is missing - set it to now()
      to = new Date().getTime();
      this.toDateString = TimeSeriesUtils.formatInputDate(new Date(to));
    }
    // from and to are set here
    if (from < to) {
      const currentSelection = this.activeSelection.absoluteSelection;
      if (currentSelection?.from !== from || currentSelection?.to !== to) {
        // something has changed
        const newSelection = {
          type: RangeSelectionType.ABSOLUTE,
          absoluteSelection: { from: from, to: to },
        };
        this.emitSelectionChange(newSelection);
        this.closeMenu();
      } else {
        // do nothing
      }
    } else {
      this._snackBar.open("Invalid interval: 'From' must be before 'To'", 'dismiss');
    }
  }

  onRelativeSelectionSelected(option: TimeRangePickerSelection) {
    if (option.type === RangeSelectionType.FULL) {
      this.onFullRangeSelect();
      return;
    }
    if (
      this.activeSelection.type === RangeSelectionType.RELATIVE &&
      this.activeSelection.relativeSelection!.timeInMs === option.relativeSelection!.timeInMs
    ) {
      return;
    }
    this.emitSelectionChange(option);
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
