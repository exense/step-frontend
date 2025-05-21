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
import { TIME_UNIT_DICTIONARY, TimeConvertersFactoryService, TimeRange, TimeUnit } from '@exense/step-core';

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
  readonly TIME_UNIT_LABELS: Record<string, string> = {
    [TimeUnit.MINUTE]: 'min',
    [TimeUnit.HOUR]: 'hrs',
    [TimeUnit.DAY]: 'days',
  };
  private _snackBar = inject(MatSnackBar);
  private _converter = inject(TimeConvertersFactoryService).timeConverter();

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  activeSelection = input.required<TimeRangePickerSelection>();
  selectOptions = input.required<TimeRangePickerSelection[]>();
  activeTimeRange = input<TimeRange>(); // represent the time-range that should be displayed in the inputs
  @Input() compact = false;
  @Input() fullRangeLabel?: string; // used to override the "Full Selection" default label

  @Output() selectionChange = new EventEmitter<TimeRangePickerSelection>();

  otherOptionSelected = signal<boolean>(false);
  otherOptionValue = model<number | undefined>(undefined);
  otherOptionUnit = model<TimeUnit>(TimeUnit.MINUTE);

  // when auto-refresh is enabled or the changes come from exterior, the inputs may be updated in the middle of editing
  dateTimeInputsLocked = false;

  private handleSelectionChange = effect(() => {
    console.log('hook called');
    const selection = this.activeSelection();
    const selectOptions = this.selectOptions();
    if (selection && selection.type === 'RELATIVE') {
      const existingOption = selectOptions.find(
        (opt) => opt.type === 'RELATIVE' && opt.relativeSelection?.timeInMs === selection.relativeSelection?.timeInMs,
      );

      untracked(() => {
        this.otherOptionSelected.set(false);
        if (!existingOption) {
          // Custom relative selection
          const timeInMs = selection.relativeSelection?.timeInMs ?? 0;

          // Determine best display unit
          const displayUnit = this._converter.autoDetermineDisplayMeasure(
            timeInMs,
            TimeUnit.MILLISECOND,
            [TimeUnit.MINUTE, TimeUnit.HOUR, TimeUnit.DAY], // Allowed units — adjust if needed
            TimeUnit.MINUTE,
          );

          // Compute the display value (e.g., 300000 ms → 5, with unit MINUTE)
          const displayValue = this._converter.calculateDisplayValue(timeInMs, TimeUnit.MILLISECOND, displayUnit);

          this.otherOptionSelected.set(true);
          this.otherOptionValue.set(displayValue);
          this.otherOptionUnit.set(displayUnit);
        } else {
          this.otherOptionSelected.set(false);
        }
      });
    }
  });

  selectOtherOption() {
    console.log('updating');
    this.otherOptionSelected.set(true);
  }

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
      const label = selection.relativeSelection?.label;
      console.log('label', label);
      if (label) {
        return label;
      }

      const timeInMs = selection.relativeSelection?.timeInMs ?? 0;
      const displayUnit = this._converter.autoDetermineDisplayMeasure(
        timeInMs,
        TimeUnit.MILLISECOND,
        Object.values(TIME_UNIT_DICTIONARY),
        TimeUnit.MINUTE,
      );
      console.log('display unit', displayUnit);
      const displayValue = this._converter.calculateDisplayValue(timeInMs, TimeUnit.MILLISECOND, displayUnit);

      return `Last ${displayValue} ${this.TIME_UNIT_LABELS[displayUnit]}`;
    }

    return 'Unknown';
  });

  applyOtherTimeRange() {
    let unit: TimeUnit = this.otherOptionUnit()!;
    let value = this.otherOptionValue();
    if (!unit || !value) {
      return;
    }
    this.emitSelectionChange({ type: 'RELATIVE', relativeSelection: { timeInMs: value! * unit } });
    this.closeMenu();
  }

  timeRangeInputsSyncEffect = effect(() => {
    const timeRange = this.activeTimeRange();
    if (!this.dateTimeInputsLocked) {
      this.fillInputs(timeRange);
    }
  });

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
    this.otherOptionSelected.set(false);
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
    this.otherOptionSelected.set(false);
    if (option.type === 'RELATIVE') {
      if (option.relativeSelection!.timeInMs === this.activeSelection()?.relativeSelection?.timeInMs) {
        return;
      }
    } else if (option.type === 'FULL') {
      const selectionFrom = option.absoluteSelection?.from;
      const selectionTo = option.absoluteSelection?.to;
      if (selectionFrom) {
        // this.fromDate = DateTime.fromMillis(selectionFrom!);
        // this.fromDateString = TimeSeriesUtils.formatInputDate(new Date(selectionFrom!));
      }
      if (selectionTo) {
        // this.toDate = DateTime.fromMillis(selectionTo!);
        // this.toDateString = TimeSeriesUtils.formatInputDate(new Date(selectionTo!));
      }
    }
    this.emitSelectionChange(option);
  }

  emitSelectionChange(selection: TimeRangePickerSelection) {
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
