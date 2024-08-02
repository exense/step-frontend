import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyValue } from '@angular/common';

type OnChange = <T>(value?: T[]) => void;
type OnTouch = () => void;

export enum SelectAll {
  NONE,
  EMPTY_LIST_WHEN_ALL_SELECTED,
  FILLED_LIST_WHEN_ALL_SELECTED,
}

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

  protected readonly SelectAll = SelectAll;

  readonly selectAll = input(SelectAll.NONE);
  protected selectAllValue = computed(() => {
    const selected = this.selected();
    const items = this.items();
    return selected?.length === items.length;
  });

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
    this.assignModel(value);
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

  protected toggleItem(key: T, isSelected: boolean): void {
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
    this.emitModelChange(selected);
    this.onTouch?.();
  }

  protected toggleSelectAll(): void {
    if (this.isDisabled()) {
      return;
    }
    const currentSelection = this.selectAllValue();
    const selected = currentSelection ? [] : this.items().map((item) => item.key);
    this.selected.set(selected);
    this.emitModelChange(selected);
    this.onTouch?.();
  }

  private assignModel(value?: T[]): void {
    if (this.selectAll() !== SelectAll.EMPTY_LIST_WHEN_ALL_SELECTED) {
      this.selected.set(value);
      return;
    }

    if (!value) {
      this.selected.set(this.items().map((item) => item.key));
    } else {
      this.selected.set(value);
    }
  }

  private emitModelChange(value?: T[]): void {
    if (this.selectAll() !== SelectAll.EMPTY_LIST_WHEN_ALL_SELECTED) {
      this.onChange?.(value);
      return;
    }

    if (value?.length === this.items().length) {
      this.onChange?.(undefined);
    } else {
      this.onChange?.(value);
    }
  }
}
