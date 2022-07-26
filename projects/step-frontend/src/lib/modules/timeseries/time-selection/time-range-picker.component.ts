import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeSelection } from './model/time-selection';
import { RelativeTimeSelection } from './model/relative-time-selection';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'step-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
})
export class TimeRangePicker implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  @Output('selectionChange') onSelectionChange = new EventEmitter<TimeSelection>();

  _30_MINUTES = 30 * 60 * 1000; // in ms

  relativeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 minute', timeInMs: this._30_MINUTES / 30 },
    { label: 'Last 5 minutes', timeInMs: this._30_MINUTES / 6 },
    { label: 'Last 15 minutes', timeInMs: this._30_MINUTES / 2 },
    { label: 'Last 30 minutes', timeInMs: this._30_MINUTES },
    { label: 'Last 1 hour', timeInMs: this._30_MINUTES * 2 },
    { label: 'Last 3 hours', timeInMs: this._30_MINUTES * 6 },
  ];

  from: Date | undefined;
  to: Date | undefined;

  fromString: string | undefined;
  toString: string | undefined;

  activeSelection: TimeSelection | undefined;

  ngOnInit(): void {}

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  applyAbsoluteInterval() {
    let fromTs = this.fromString ? new Date(this.fromString).getTime() : undefined;
    let toTs = this.fromString ? new Date(this.toString).getTime() : undefined;
    console.log(fromTs);
    this.activeSelection = {
      isRelativeSelection: false,
      absoluteSelection: { from: fromTs, to: toTs },
    };
    this.emitSelectionChange();
    this.closeMenu();
  }

  selectRelativeInterval(option: RelativeTimeSelection) {
    this.resetCustomDates();
    this.activeSelection = { isRelativeSelection: true, relativeSelection: option, absoluteSelection: undefined };
    this.emitSelectionChange();
  }

  selectFullRange() {
    this.resetCustomDates();
    this.activeSelection = undefined;
    this.emitSelectionChange();
  }

  setCustomSelection(from?: number, to?: number) {
    this.activeSelection = { isRelativeSelection: false, absoluteSelection: { from, to } };
  }

  emitSelectionChange() {
    this.onSelectionChange.emit(this.activeSelection);
  }

  setFromDate(event: MatDatepickerInputEvent<any>) {
    console.log(event.value.ts);
    let date = new Date(event.value.ts);
    this.fromString = `${date.toLocaleDateString()} 00:00:00`;
  }

  resetCustomDates() {
    this.from = undefined;
    this.to = undefined;
  }
}
