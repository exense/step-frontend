import { Component, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RANGE_WEEK_DAY, RangeItem, trackByRange } from '../../injectables/ranges.tokens';

type OnChange = (weeks?: string[]) => void;
type OnTouch = () => void;

interface DayInfo extends RangeItem {
  isSelected?: boolean;
}

@Component({
  selector: 'step-day-of-week-selector',
  templateUrl: './day-of-week-selector.component.html',
  styleUrls: ['./day-of-week-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DayOfWeekSelectorComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class DayOfWeekSelectorComponent implements ControlValueAccessor {
  readonly _WEEK_DAYS = inject(RANGE_WEEK_DAY).map((item) => ({ ...item, isSelected: false }) as DayInfo);

  readonly trackByDay = trackByRange;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected isDisabled: boolean = false;

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value?: string[]): void {
    const weeks = value ?? [];
    this._WEEK_DAYS.forEach((dayOfWeek) => {
      dayOfWeek.isSelected = weeks.includes(dayOfWeek.key as string);
    });
  }

  protected handleDayChange(dayInfo: DayInfo): void {
    dayInfo.isSelected = !dayInfo.isSelected;
    const weeks = this._WEEK_DAYS.filter((item) => item.isSelected).map((item) => item.key as string);
    this.onChange?.(weeks);
    this.onTouch?.();
  }
}
