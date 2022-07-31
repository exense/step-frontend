import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { RelativeTimeSelection } from './model/relative-time-selection';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeRangePickerSelection } from './time-range-picker-selection';
import { RangeSelectionType } from './model/range-selection-type';

@Component({
  selector: 'step-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
})
export class TimeRangePicker implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Output('selectionChange') onSelectionChange = new EventEmitter<TimeRangePickerSelection>();

  _30_MINUTES = 30 * 60 * 1000; // in ms

  relativeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 minute', timeInMs: this._30_MINUTES / 30 },
    { label: 'Last 5 minutes', timeInMs: this._30_MINUTES / 6 },
    { label: 'Last 15 minutes', timeInMs: this._30_MINUTES / 2 },
    { label: 'Last 30 minutes', timeInMs: this._30_MINUTES },
    { label: 'Last 1 hour', timeInMs: this._30_MINUTES * 2 },
    { label: 'Last 3 hours', timeInMs: this._30_MINUTES * 6 },
  ];

  // from: Date | undefined; // used for mat picker
  // to: Date | undefined; // used for mat picker

  fromDateString: string | undefined; // used for formatting the date together with time
  toDateString: string | undefined;

  activeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  ngOnInit(): void {}

  applyAbsoluteInterval() {
    let from = undefined;
    let to = undefined;
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
      this.emitSelectionChange({ type: RangeSelectionType.FULL });
    } else {
      let newSelection = {
        type: RangeSelectionType.ABSOLUTE,
        absoluteSelection: { from: from, to: to },
      };
      this.emitSelectionChange(newSelection);
    }
    this.closeMenu();
  }

  selectRelativeInterval(option: RelativeTimeSelection) {
    this.resetCustomDates();
    this.emitSelectionChange({ type: RangeSelectionType.RELATIVE, relativeSelection: option });
  }

  selectFullRange() {
    this.resetCustomDates();
    this.emitSelectionChange({ type: RangeSelectionType.FULL });
  }

  setAbsoluteSelection(from?: number, to?: number) {
    this.resetCustomDates();
    if (from) {
      let date = new Date(from);
      this.fromDateString = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
    if (to) {
      let date = new Date(to);
      this.toDateString = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
    this.emitSelectionChange({ type: RangeSelectionType.ABSOLUTE, absoluteSelection: { from, to } });
  }

  emitSelectionChange(selection: TimeRangePickerSelection) {
    this.activeSelection = selection;
    this.onSelectionChange.emit(selection);
  }

  setFromDate(event: MatDatepickerInputEvent<any>) {
    let date = new Date(event.value.ts);
    this.fromDateString = `${date.toLocaleDateString()} 00:00:00`;
  }

  setToDate(event: MatDatepickerInputEvent<any>) {
    let date = new Date(event.value.ts);
    this.toDateString = `${date.toLocaleDateString()} 00:00:00`;
  }

  resetCustomDates() {
    this.fromDateString = undefined;
    this.toDateString = undefined;
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  isValidDate(stringValue: string): boolean {
    let dateObject = new Date(stringValue);
    // @ts-ignore
    return dateObject !== 'Invalid Date' && !isNaN(dateObject); // from mozilla+chrome and IE8
  }

  get RangeSelectionType() {
    return RangeSelectionType;
  }
}
