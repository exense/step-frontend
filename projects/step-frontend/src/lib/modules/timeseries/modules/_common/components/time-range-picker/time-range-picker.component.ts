import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  model,
  OnInit,
  Output,
  untracked,
  ViewChild,
  signal,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeRangePickerSelection } from '../../types/time-selection/time-range-picker-selection';
import { TimeSeriesUtils } from '../../../_common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';
import {
  TIME_UNIT_DICTIONARY,
  TIME_UNIT_LABELS,
  TimeConvertersFactoryService,
  TimeRange,
  TimeUnit,
} from '@exense/step-core';

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
export class TimeRangePickerComponent implements OnInit {
  timeUnitOptions = [TimeUnit.MINUTE, TimeUnit.HOUR, TimeUnit.DAY];
  readonly TIME_UNIT_LABELS_SINGULAR: Record<string, string> = {
    [TimeUnit.SECOND]: 'second',
    [TimeUnit.MINUTE]: 'minute',
    [TimeUnit.HOUR]: 'hour',
    [TimeUnit.DAY]: 'day',
    [TimeUnit.WEEK]: 'week',
    [TimeUnit.MONTH]: 'month',
    [TimeUnit.YEAR]: 'year',
  };
  readonly TIME_UNIT_LABELS_PLURAL: Record<string, string> = {
    [TimeUnit.SECOND]: 'seconds',
    [TimeUnit.MINUTE]: 'minutes',
    [TimeUnit.HOUR]: 'hours',
    [TimeUnit.DAY]: 'days',
    [TimeUnit.WEEK]: 'weeks',
    [TimeUnit.MONTH]: 'months',
    [TimeUnit.YEAR]: 'years',
  };
  private _snackBar = inject(MatSnackBar);
  private _converter = inject(TimeConvertersFactoryService).timeConverter();

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  activeSelection = input.required<TimeRangePickerSelection>();
  draftSelection = signal<TimeRangePickerSelection | undefined>(undefined);
  selectOptions = input.required<TimeRangePickerSelection[]>();
  activeTimeRange = input<TimeRange>(); // represent the time-range that should be displayed in the inputs
  @Input() compact = false;
  @Input() fullRangeLabel?: string; // used to override the "Full Selection" default label

  @Output() selectionChange = new EventEmitter<TimeRangePickerSelection>();

  otherOptionValue = model<number | undefined>(undefined);
  otherOptionUnit = model<TimeUnit>(TimeUnit.MINUTE);

  // when auto-refresh is enabled or the changes come from exterior, the inputs may be updated in the middle of editing
  dateTimeInputsLocked = false;

  protected mainPickerLabel = computed(() => {
    const selection = this.activeSelection();
    if (!selection) {
      return;
    }

    if (selection.type === 'FULL' || selection.type === 'ABSOLUTE') {
      const range = selection.absoluteSelection;
      return range ? TimeSeriesUtils.formatRange(range) : 'Full range';
    }

    if (selection.type === 'RELATIVE') {
      let convertedValue = this.convertMsValue(selection.relativeSelection!.timeInMs);
      let unit = '';
      if (convertedValue.value === 1) {
        unit = this.TIME_UNIT_LABELS_SINGULAR[convertedValue.unit];
      } else {
        unit = this.TIME_UNIT_LABELS_PLURAL[convertedValue.unit];
      }

      return `Last ${convertedValue.value} ${unit}`;
    }

    return 'Unknown';
  });

  private convertMsValue(timeInMs: number): { value: number; unit: TimeUnit } {
    const displayUnit = this._converter.autoDetermineDisplayMeasure(
      timeInMs,
      TimeUnit.MILLISECOND,
      Object.values(TIME_UNIT_DICTIONARY),
      TimeUnit.MINUTE,
    );
    const displayValue = this._converter.calculateDisplayValue(timeInMs, TimeUnit.MILLISECOND, displayUnit);
    return { value: displayValue, unit: displayUnit };
  }

  applyRelativeTimeRange() {
    if (this.draftSelection()?.type === 'FULL') {
      this.emitSelectionChange({ type: 'FULL' });
      this.closeMenu();
      return;
    }
    let unit: TimeUnit = this.otherOptionUnit()!;
    let value = this.otherOptionValue();
    if (!unit || !value) {
      return;
    }
    this.draftSelection.set({ type: 'RELATIVE', relativeSelection: { timeInMs: value! * unit } });
    this.emitSelectionChange(this.draftSelection()!);
    this.closeMenu();
  }

  fillInputs(range?: TimeRange) {
    if (range) {
      this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(range.from));
      this.toDateString = TimeSeriesUtils.formatInputDate(new Date(range.to));
      this.fromDate = DateTime.fromMillis(range.from);
      this.toDate = DateTime.fromMillis(range.to);
    }
  }

  fromDate: DateTime | undefined;
  toDate: DateTime | undefined;
  fromDateString: string | undefined; // used for formatting the date together with time
  toDateString: string | undefined;

  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  hasFullRangeOption = computed(() => {
    return this.selectOptions().some((option) => option.type === 'FULL');
  });

  handleMenuClose() {
    this.dateTimeInputsLocked = false;
  }

  handleMenuOpen() {
    // make sure fresh data is displayed
    let activeSelection = this.activeSelection();
    this.draftSelection.set({ ...activeSelection });
    if (activeSelection.type === 'RELATIVE') {
      // we deal with a custom relative range
      const convertedValue = this.convertMsValue(activeSelection.relativeSelection!.timeInMs);
      this.otherOptionValue.set(convertedValue.value);
      this.otherOptionUnit.set(convertedValue.unit);
    }
    this.fillInputs(this.activeTimeRange());
  }

  lockInputs() {
    this.dateTimeInputsLocked = true;
  }

  ngOnInit(): void {
    if (!this.selectOptions()) {
      throw new Error('Options param is mandatory');
    }
  }

  onFromInputLeave() {
    const inputDate = TimeSeriesUtils.parseFormattedDate(this.fromDateString);

    if (inputDate) {
      this.fromDate = DateTime.fromJSDate(inputDate);
    } else {
      // invalid date
      if (this.activeTimeRange()) {
        const from: number = this.activeTimeRange()!.from;
        this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(from));
        this.fromDate = DateTime.fromMillis(from);
      } else {
        this.fromDate = undefined;
        this.fromDateString = '';
      }
    }
  }

  onToInputLeave() {
    const inputDate = TimeSeriesUtils.parseFormattedDate(this.toDateString);
    if (inputDate) {
      this.toDate = DateTime.fromJSDate(inputDate);
    } else {
      // invalid date
      if (this.activeTimeRange()) {
        const to: number = this.activeTimeRange()!.to;
        this.toDateString = TimeSeriesUtils.formatInputDate(new Date(to));
        this.toDate = DateTime.fromMillis(to);
      } else {
        this.toDate = undefined;
        this.toDateString = '';
      }
    }
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
      const currentSelection = this.activeSelection().absoluteSelection;
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

  onRelativeOrFullSelectionSelected(option: TimeRangePickerSelection) {
    this.emitSelectionChange(option);
  }

  emitSelectionChange(selection: TimeRangePickerSelection) {
    this.selectionChange.emit(selection);
    this.closeMenu();
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
