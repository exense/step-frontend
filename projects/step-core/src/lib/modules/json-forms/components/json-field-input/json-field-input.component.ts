import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  Optional,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { JsonFieldType } from '../../types/json-field-type.enum';
import { StepBasicsModule } from '../../../basics/step-basics.module';

type FieldValue = string | boolean | number;

type OnChange = (fieldValue?: FieldValue) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-json-field-input',
  imports: [StepBasicsModule],
  templateUrl: './json-field-input.component.html',
  styleUrl: './json-field-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonFieldInputComponent implements ControlValueAccessor {
  private onChange?: OnChange;
  private onTouch?: OnTouch;

  readonly tabIndex = input<number | undefined>(undefined);
  readonly label = input('', {
    transform: (value: string | undefined) => value ?? '',
  });
  readonly labelChange = output<string>();
  readonly canEditLabel = input(false, {
    transform: (value: boolean | undefined) => value ?? false,
  });
  readonly tooltip = input('', {
    transform: (value: string | undefined) => value ?? '',
  });
  readonly fieldType = input(JsonFieldType.STRING);
  readonly canRemove = input(false);
  readonly remove = output();
  readonly enumItems = input([], {
    transform: (value: string[] | undefined) => value ?? [],
  });
  readonly elementRefMapKey = input<string | undefined>(undefined);

  private enumItemsSet = computed(() => new Set(this.enumItems() ?? []));

  protected labelModel = model('');
  protected fieldValue = signal<FieldValue | undefined>(undefined);
  protected isDisabled = signal(false);
  protected forceFocus = signal(false);

  private effLabelChange = effect(
    () => {
      const inputLabel = this.label();
      this.labelModel.set(inputLabel);
    },
    { allowSignalWrites: true },
  );

  protected displayEnumExtraValue = computed(() => {
    const fieldType = this.fieldType();
    const fieldValue = this.fieldValue();
    const enumItemsSet = this.enumItemsSet();

    if (fieldType !== JsonFieldType.ENUM) {
      return false;
    }

    return enumItemsSet.has(fieldValue ? fieldValue.toString() : '');
  });

  constructor(@Optional() protected _ngControl?: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  writeValue(fieldValue?: FieldValue): void {
    this.fieldValue.set(fieldValue);
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

  protected finishLabelChange(): void {
    this.labelChange.emit(this.labelModel());
  }

  protected handleValueChange(value: FieldValue, type?: JsonFieldType): void {
    if ((type === JsonFieldType.ARRAY || type === JsonFieldType.OBJECT) && typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // we don't show the error since they may happen for in-between states when typing an object
        return;
      }
    }

    this.fieldValue.set(value);
    this.onChange?.(value);
  }

  protected fixLabelFocus($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  protected readonly JsonFieldType = JsonFieldType;
}
