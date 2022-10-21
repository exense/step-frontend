import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { RelativeTimeSelection } from './model/relative-time-selection';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeRangePickerSelection } from './time-range-picker-selection';
import { RangeSelectionType } from './model/range-selection-type';
import { ExecutionTimeSelection } from './model/execution-time-selection';

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

  _30_MINUTES = 30 * 60 * 1000; // in ms

  defaultRelativeOptions: RelativeTimeSelection[] = [
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

  activeSelection!: TimeRangePickerSelection;

  ngOnInit(): void {
    if (this.initialSelectionIndex != undefined) {
      this.activeSelection = {
        type: RangeSelectionType.RELATIVE,
        relativeSelection: (this.customRelativeOptions || this.defaultRelativeOptions)[this.initialSelectionIndex],
      };
    } else {
      if (this.includeFullRangeOption) {
        this.activeSelection = { type: RangeSelectionType.FULL };
      } else {
        this.activeSelection = {
          type: RangeSelectionType.RELATIVE,
          relativeSelection: (this.customRelativeOptions || this.defaultRelativeOptions)[0],
        };
      }
    }
  }

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
      if (this.includeFullRangeOption) {
        this.emitSelectionChange({ type: RangeSelectionType.FULL });
      }
      // else do nothing. maybe show an error
    } else {
      let newSelection = {
        type: RangeSelectionType.ABSOLUTE,
        absoluteSelection: { from: from, to: to },
      };
      this.emitSelectionChange(newSelection);
    }
    this.closeMenu();
  }

  onRelativeSelectionSelected(option: RelativeTimeSelection) {
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
  onFullRangeSelect() {
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
    let from = selection.absoluteSelection!.from;
    let to = selection.absoluteSelection!.to;
    this.resetCustomDates();
    if (from) {
      let date = new Date(from);
      this.fromDateString = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
    if (to) {
      let date = new Date(to);
      this.toDateString = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
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

  getActiveSelection() {
    return this.activeSelection;
  }

  get RangeSelectionType() {
    return RangeSelectionType;
  }
}
