import { Component, input, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl, NgModel } from '@angular/forms';

type OnChange = (value: Record<string, string>) => void;
type OnTouch = () => void;

interface ObjectField {
  id: string;
  name: string;
  value: string;
}

@Component({
  selector: 'step-simple-object-input',
  templateUrl: './simple-object-input.component.html',
  styleUrl: './simple-object-input.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SimpleObjectInputComponent implements ControlValueAccessor {
  private onChange?: OnChange;
  private onTouch?: OnTouch;

  readonly showAddFieldBtn = input(true);
  readonly addFieldLabel = input('');

  protected isDisabled = signal(false);
  protected fields = signal<ObjectField[]>([]);
  protected readonly ngModelOptions: NgModel['options'] = {
    updateOn: 'blur',
  };

  constructor(protected readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(value?: Record<string, string>): void {
    this.fields.set(this.convertValueToFields(value));
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

  addNewField(): void {
    if (this.isDisabled()) {
      return;
    }
    this.fields.update((fields) => {
      const size = fields.length;
      return [...fields, { id: `field_${size}`, name: '', value: '' }];
    });
    this.onTouch?.();
  }

  protected removeField(field: ObjectField): void {
    if (this.isDisabled()) {
      return;
    }
    if (!this.fields().includes(field)) {
      return;
    }
    const emitChangeRequired = !!field.name.trim();
    this.fields.update((fields) => fields.filter((item) => item !== field));
    if (emitChangeRequired) {
      this.onChange?.(this.convertFieldsToValue(this.fields()));
    }
    this.onTouch?.();
  }

  protected changeName(field: ObjectField, name: string): void {
    if (this.isDisabled()) {
      return;
    }
    const emitChange = !!field.name.trim() || !!name.trim();
    field.name = name;
    this.updateField(field, emitChange);
  }

  protected changeValue(field: ObjectField, value: string): void {
    if (this.isDisabled()) {
      return;
    }
    const emitChange = !!field.name.trim();
    field.value = value;
    this.updateField(field, emitChange);
  }

  private updateField(field: ObjectField, emitChange: boolean): void {
    if (!this.fields().includes(field)) {
      return;
    }
    this.fields.update((fields) => {
      const index = fields.indexOf(field);
      fields[index] = { ...field };
      return [...fields];
    });
    if (emitChange) {
      this.onChange?.(this.convertFieldsToValue(this.fields()));
    }
    this.onTouch?.();
  }

  private convertValueToFields(value?: Record<string, string>): ObjectField[] {
    return Object.entries(value ?? {}).map(([key, value], index) => ({
      id: `field_${index}`,
      name: key,
      value: value,
    }));
  }

  private convertFieldsToValue(fields: ObjectField[]): Record<string, string> {
    return fields.reduce(
      (result, field) => {
        const name = field.name.trim();
        if (name) {
          result[name] = field.value;
        }
        return result;
      },
      {} as Record<string, string>,
    );
  }
}
