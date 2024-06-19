import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyValue } from '@angular/common';

type OnChange = <T>(value?: T[]) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-list-select',
  templateUrl: './list-select.component.html',
  styleUrl: './list-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListSelectComponent),
      multi: true,
    },
  ],
})
export class ListSelectComponent<T> implements ControlValueAccessor {
  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private selected = signal<T[] | undefined>(undefined);
  protected isDisabled = signal(false);

  /**
   * @Input()
   * **/
  readonly items = input<KeyValue<T, string>[]>([]);

  protected readonly displayList = computed(() => {
    const items = this.items();
    const selected = this.selected();
    const selectedSet = new Set(selected ?? []);

    return items.map(({ key, value }) => {
      const isSelected = selectedSet.has(key);
      return {
        key,
        value,
        isSelected,
      };
    });
  });

  writeValue(value?: T[]): void {
    this.selected.set(value);
  }

  registerOnChange(onChange?: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch?: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggleItem(key: T, isSelected: boolean): void {
    if (this.isDisabled()) {
      return;
    }

    let selected = this.selected();
    if (isSelected) {
      // deselect
      selected = selected?.filter((item) => item !== key);
      if (!selected?.length) {
        selected = undefined;
      }
    } else {
      // select
      if (!selected?.length) {
        selected = [key];
      } else {
        selected = selected.concat(key);
      }
    }
    this.selected.set(selected);
    this.onChange?.(selected);
    this.onTouch?.();
  }
}
