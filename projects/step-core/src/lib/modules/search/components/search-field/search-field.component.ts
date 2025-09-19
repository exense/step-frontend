import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { SearchFieldAddonDirective } from '../../directives/search-field-addon.directive';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-search-field',
  imports: [StepBasicsModule],
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent implements ControlValueAccessor {
  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected readonly isDisabled = signal(false);
  protected readonly value = signal('');

  readonly searchIndex = model.required<number>();
  readonly total = input.required<number>();

  readonly hint = input('');

  readonly disableNavButtonsWithControl = input(true);

  private areNavButtonsDisabled = computed(() => {
    const isDisabled = this.isDisabled();
    const disableNavButtonsWithControl = this.disableNavButtonsWithControl();
    return disableNavButtonsWithControl ? isDisabled : false;
  });

  protected readonly areButtonsActive = computed(() => {
    const isDisabled = this.areNavButtonsDisabled();
    const value = (this.value() ?? '').trim();
    const total = this.total();
    if (isDisabled) {
      return false;
    }
    return !!value && total > 0;
  });

  protected readonly searchLabel = computed(() => {
    const value = (this.value() ?? '').trim();
    const searchIndex = this.searchIndex();
    const total = this.total();
    if (!value || total <= 0) {
      return '';
    }
    return `${searchIndex + 1} / ${total}`;
  });

  private effectResetSearch = effect(() => {
    const value = this.value();
    const total = this.total();
    this.searchIndex.set(0);
  });

  private fieldAddon = contentChild(SearchFieldAddonDirective);
  protected readonly fieldAddonTemplate = computed(() => this.fieldAddon()?._templateRef);

  constructor(public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(value: string): void {
    this.value.set(value);
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected handleValueChange(value: string): void {
    this.value.set(value);
    this.onChange?.(value);
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  protected next(): void {
    if (!this.areButtonsActive()) {
      return;
    }
    const total = this.total();
    this.searchIndex.update((current) => (current + 1) % total);
    this.onTouch?.();
  }

  protected prev(): void {
    if (!this.areButtonsActive()) {
      return;
    }
    const total = this.total();
    this.searchIndex.update((current) => {
      const res = current - 1;
      return res < 0 ? total - 1 : res;
    });
    this.onTouch?.();
  }
}
