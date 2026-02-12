import { Component } from '@angular/core';
import { DatePickerModule, DateRange, TimeOption } from '@exense/step-core';
import { DateTime } from 'luxon';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

const start = DateTime.fromISO('2021-06-21');
const end = start.plus({ day: 1 });

const MILLISECONDS_RANGE = 10_000;

const TIME_OPTIONS: TimeOption[] = [
  { label: 'Defined range', value: { start, end } },
  { label: 'Relative range', value: { isRelative: true, msFromNow: MILLISECONDS_RANGE } },
];

@Component({
  selector: 'step-relative-time-picker-test',
  imports: [DatePickerModule],
  template: `<step-relative-time-picker
    [relativeTimes]="timeOptions"
    (rangeChange)="handleRangeChange($event)"
    (relativeOptionChange)="handleRelativeOptionChange($event)"
  />`,
})
export class RelativeTimePickerTestComponent {
  readonly timeOptions = TIME_OPTIONS;

  handleRangeChange(range: DateRange): void {}

  handleRelativeOptionChange(timeOption?: TimeOption): void {}
}

describe('RelativeTimePicker', () => {
  let fixture: ComponentFixture<RelativeTimePickerTestComponent>;
  let spyHandleRangeChange: jest.SpyInstance;
  let spyHandleRelativeOptionChange: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeTimePickerTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RelativeTimePickerTestComponent);
    spyHandleRangeChange = jest.spyOn(fixture.componentInstance, 'handleRangeChange');
    spyHandleRangeChange.mockReset();
    spyHandleRelativeOptionChange = jest.spyOn(fixture.componentInstance, 'handleRelativeOptionChange');
    spyHandleRelativeOptionChange.mockReset();

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Rendering', () => {
    const divs = fixture.debugElement.queryAll(By.css('section > div')).map((el) => el.nativeElement as HTMLDivElement);

    expect(divs.length).toBe(TIME_OPTIONS.length);
    divs.forEach((div, i) => {
      expect(div.innerText).toBe(TIME_OPTIONS[i].label);
    });
  });

  it('Range change', () => {
    expect(spyHandleRangeChange).not.toHaveBeenCalled();
    expect(spyHandleRelativeOptionChange).not.toHaveBeenCalled();

    const div = fixture.debugElement.queryAll(By.css('section > div'))[0];
    div.triggerEventHandler('click');

    expect(spyHandleRangeChange).toHaveBeenCalledWith(TIME_OPTIONS[0].value);
    expect(spyHandleRelativeOptionChange).toHaveBeenCalledWith(undefined);
  });

  it('Relative range change', () => {
    const expectedRange: DateRange = {
      end,
      start: end.set({ millisecond: end.millisecond - MILLISECONDS_RANGE }),
    };
    jest.spyOn(DateTime, 'now').mockReturnValueOnce(expectedRange.end as DateTime<true>);

    expect(spyHandleRangeChange).not.toHaveBeenCalled();
    expect(spyHandleRelativeOptionChange).not.toHaveBeenCalled();

    const div = fixture.debugElement.queryAll(By.css('section > div'))[1];
    div.triggerEventHandler('click');

    expect(spyHandleRangeChange).toHaveBeenCalledWith(expectedRange);
    expect(spyHandleRelativeOptionChange).toHaveBeenCalledWith(TIME_OPTIONS[1]);
  });
});
