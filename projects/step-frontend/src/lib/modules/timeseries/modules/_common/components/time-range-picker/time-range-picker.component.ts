import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeRangePickerSelection } from '../../types/time-selection/time-range-picker-selection';
import { ExecutionTimeSelection } from '../../types/time-selection/execution-time-selection';
import { TimeSeriesUtils } from '../../../_common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';
import { TimeRange } from '@exense/step-core';

/**
 * When dealing with relative/full selection, this component should not know anything about dates, therefore no date calculations are needed.
 * This is in order to keep this component as simple as possible.
 */
@Component({
  selector: 'step-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class TimeRangePickerComponent implements OnInit, OnChanges {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Input() activeSelection!: TimeRangePickerSelection;
  @Input() selectOptions!: TimeRangePickerSelection[];
  @Input() initialSelectionIndex: number | undefined;
  @Input() includeFullRangeOption: boolean = true;
  @Input() compact = false;

  @Output() selectionChange = new EventEmitter<TimeRangePickerSelection>();

  @Output() activeSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  fromDateString: string | undefined; // used for formatting the date together with time
  toDateString: string | undefined;
  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
        if (this.activeSelection.type === 'ABSOLUTE') {
          this.formatAbsoluteValues(this.activeSelection.absoluteSelection!);
        }
      }
    }
  }

  private formatAbsoluteValues(range: TimeRange) {
    if (range) {
      this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(range.from));
      this.toDateString = TimeSeriesUtils.formatInputDate(new Date(range.to));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectionChange = changes['activeSelection'];
    if (selectionChange?.previousValue !== selectionChange?.currentValue) {
      const selection: TimeRangePickerSelection = selectionChange.currentValue;
      if (selection.type === 'ABSOLUTE') {
        this.formatAbsoluteValues(selection.absoluteSelection!);
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
        this.emitSelectionChange({ type: 'FULL' });
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
        const newSelection: TimeRangePickerSelection = {
          type: 'ABSOLUTE',
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
    if (option.type === 'FULL') {
      this.onFullRangeSelect();
      return;
    }
    if (
      this.activeSelection.type === 'RELATIVE' &&
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
    this.activeSelection = { type: 'FULL' };
  }

  /**
   * This method reacts to the component html selection change, and should NOT be used from exterior
   */
  onFullRangeSelect(): void {
    this.emitSelectionChange({ type: 'FULL' });
  }

  /**
   * This should be called from the exterior.
   * @param selection
   */
  setSelection(selection: ExecutionTimeSelection) {
    this.activeSelection = selection;
    if (selection.type === 'ABSOLUTE') {
      this.setAbsoluteSelection(selection);
    } else if (selection.type === 'RELATIVE') {
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
    this.selectionChange.emit(selection);
  }

  setFromDate(date?: DateTime | null): void {
    if (!date) {
      return;
    }
    this.fromDateString = TimeSeriesUtils.formatInputDate(date.toJSDate());
  }

  setToDate(date?: DateTime | null) {
    if (!date) {
      return;
    }
    let jsDate = date.toJSDate();
    jsDate.setHours(23, 59, 59);
    this.toDateString = TimeSeriesUtils.formatInputDate(jsDate);
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
}
