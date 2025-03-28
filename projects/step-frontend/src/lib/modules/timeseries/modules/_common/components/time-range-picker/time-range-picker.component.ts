import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeRangePickerSelection } from '../../types/time-selection/time-range-picker-selection';
import { TimeSeriesUtils } from '../../../_common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';

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
  private _snackBar = inject(MatSnackBar);

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Input() activeSelection!: TimeRangePickerSelection;
  selectOptions = input.required<TimeRangePickerSelection[]>();
  @Input() initialSelectionIndex: number | undefined;
  @Input() compact = false;
  @Input() fullRangeLabel?: string; // used to override the "Full Selection" default label

  @Output() selectionChange = new EventEmitter<TimeRangePickerSelection>();

  fromDateString: string | undefined; // used for formatting the date together with time
  protected mainPickerLabel: string = '';
  toDateString: string | undefined;
  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  hasFullRangeOption = computed(() => {
    return this.selectOptions().some((option) => option.type === 'FULL');
  });

  ngOnInit(): void {
    if (!this.selectOptions()) {
      throw new Error('Options param is mandatory');
    }
    if (this.initialSelectionIndex != undefined) {
      this.activeSelection = this.selectOptions()[0];
    } else {
      if (!this.activeSelection) {
        this.activeSelection = this.selectOptions()[0];
      }
    }
    this.formatSelectionLabel(this.activeSelection);
  }

  private formatSelectionLabel(selection: TimeRangePickerSelection) {
    if (!selection) {
      return;
    }
    if (selection.type === 'FULL' || selection.type === 'ABSOLUTE') {
      const range = selection.absoluteSelection;
      if (range) {
        this.mainPickerLabel = TimeSeriesUtils.formatRange(range);
      } else {
        this.mainPickerLabel = 'Full range';
      }
    } else {
      this.mainPickerLabel = selection.relativeSelection!.label!;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectionChange = changes['activeSelection'];
    const previousValue = selectionChange?.previousValue;
    const currentValue: TimeRangePickerSelection = selectionChange?.currentValue;
    if (!currentValue) {
      return;
    }
    if (selectionChange.firstChange) {
      if (currentValue!.type === 'ABSOLUTE') {
        this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(currentValue.absoluteSelection!.from));
        this.toDateString = TimeSeriesUtils.formatInputDate(new Date(currentValue.absoluteSelection!.to));
      }
    }
    if (previousValue && previousValue !== currentValue) {
      this.formatSelectionLabel(currentValue);
      if (currentValue.type !== 'ABSOLUTE' && currentValue.type !== previousValue?.type) {
        this.cleanupAbsoluteDates();
      }
    }
  }

  cleanupAbsoluteDates() {
    this.fromDateString = '';
    this.toDateString = '';
  }

  applyAbsoluteInterval() {
    let from = 0;
    let to = 0;
    const fromDate = TimeSeriesUtils.parseFormattedDate(this.fromDateString);
    const toDate = TimeSeriesUtils.parseFormattedDate(this.toDateString);
    if (fromDate) {
      from = fromDate.getTime();
    } else {
      // the date is invalid
      this.fromDateString = undefined;
    }
    if (toDate) {
      to = toDate.getTime();
    } else {
      // the date is invalid
      this.toDateString = undefined;
    }
    if (!from && !to) {
      // both are missing
      this._snackBar.open('Time range not applied', 'dismiss');
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
        this.activeSelection = newSelection;
        this.emitSelectionChange(newSelection);
        this.closeMenu();
      } else {
        // do nothing
      }
    } else {
      this._snackBar.open("Invalid interval: 'From' must be before 'To'", 'dismiss');
    }
  }

  onRelativeOrFullSelectionSelected(option: TimeRangePickerSelection) {
    this.fromDateString = undefined;
    this.toDateString = undefined;
    if (
      option.type === 'RELATIVE' &&
      this.activeSelection.type === 'RELATIVE' &&
      this.activeSelection.relativeSelection!.timeInMs === option.relativeSelection!.timeInMs
    ) {
      return;
    }
    this.emitSelectionChange(option);
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

  closeMenu() {
    this.menuTrigger.closeMenu();
  }
}
