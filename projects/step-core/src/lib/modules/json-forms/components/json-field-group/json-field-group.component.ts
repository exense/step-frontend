import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { JsonFieldGroupValue } from '../../types/json-field-group-value';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { JsonFieldsSchema } from '../../types/json-field-schema';
import { v4 } from 'uuid';
import { JsonFieldType } from '../../types/json-field-type.enum';
import { JsonFieldMetaData } from '../../types/json-field-meta-data';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { JsonFieldUtilsService } from '../../injectables/json-field-utils.service';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { JsonFieldInputComponent } from '../json-field-input/json-field-input.component';
import { AddFieldButtonComponent } from '../add-field-button/add-field-button.component';

type OnChange = (groupValue?: JsonFieldGroupValue) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-json-field-group',
  imports: [StepBasicsModule, JsonFieldInputComponent, AddFieldButtonComponent],
  templateUrl: './json-field-group.component.html',
  styleUrl: './json-field-group.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonFieldGroupComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonFieldGroupComponent implements ControlValueAccessor, OnDestroy {
  private _fb = inject(FormBuilder).nonNullable;
  private _jsonFieldUtils = inject(JsonFieldUtilsService);
  private terminator$?: Subject<void>;

  private onChange?: OnChange;
  private onTouch?: OnTouch;
  private lastFormValue?: JsonFieldGroupValue;
  private schemaJson?: string;

  private groupValue = signal<JsonFieldGroupValue | undefined>(undefined);
  readonly schema = input<JsonFieldsSchema | undefined>(undefined);
  readonly addFieldLabel = input('Add field');
  readonly allowedNonSchemaFields = input(false);

  protected form = this._fb.group({});

  protected primaryFields = signal<JsonFieldMetaData[]>([]);
  protected optionalFields = signal<JsonFieldMetaData[]>([]);
  protected possibleFieldsToAdd = signal<string[]>([]);
  protected isDisabled = signal(false);

  private effIsDisabled = effect(() => this.enableDisableForm(this.isDisabled()));

  private effHandleChanges = effect(
    () => {
      const schema = this.schema();
      const value = this.groupValue();

      const schemaChanged = JSON.stringify(schema) !== this.schemaJson;
      if (schemaChanged) {
        this.buildForm(schema, value);
      } else if (value && !this._jsonFieldUtils.areObjectsEqual(value, this.lastFormValue)) {
        this.assignValueToForm(value);
      }
    },
    { allowSignalWrites: true },
  );

  ngOnDestroy(): void {
    this.destroyForm();
  }

  writeValue(groupValue: JsonFieldGroupValue): void {
    this.groupValue.set(groupValue);
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

  protected updateLabel(field: JsonFieldMetaData, label: string): void {
    if (field.label === label) {
      return;
    }
    field.label = label;
    const usedKeys = [...this.primaryFields(), ...this.optionalFields()]
      .filter((input) => input !== field)
      .map((input) => input.key)
      .filter((key) => !key.startsWith('temp_'));

    const newKey = !label || usedKeys.includes(label) ? this.createTemporaryKey() : label;
    this.form.removeControl(field.key);
    field.key = newKey;
    this.form.addControl(field.key, field.control);
  }

  protected removeField(field: JsonFieldMetaData): void {
    const fields = field.isRequired ? this.primaryFields : this.optionalFields;

    const hasField = fields().includes(field);
    if (!hasField) {
      return;
    }
    fields.update((list) => list.filter((item) => item !== field));
    this.form.removeControl(field.key);
    if (!field.isRequired && !field.isAdditional) {
      this.possibleFieldsToAdd.update((list) => list.concat(field.key));
    }
  }

  protected addOptionalField(fieldName?: string): void {
    const isAdditional = !fieldName;
    this.addFieldInternal(this.schema(), fieldName ?? '', this.groupValue(), { isAdditional });
  }

  private addFieldInternal(
    schema: JsonFieldsSchema | undefined,
    field: string,
    value: JsonFieldGroupValue = {},
    config?: { isRequired?: boolean; isAdditional?: boolean },
  ): void {
    const isRequired = !!config?.isRequired;
    const isAdditional = !!config?.isAdditional;

    let fieldType: JsonFieldType | undefined;
    let tooltip: string | undefined;
    let enumItems: string[] = [];

    if (!isAdditional) {
      const fieldDescription = schema?.properties[field];
      if (!fieldDescription) {
        throw new Error('Invalid schema');
      }
      const params = this._jsonFieldUtils.determineFieldMetaParameters(fieldDescription);
      fieldType = params.fieldType;
      enumItems = params.enumItems;
      tooltip = params.tooltip;
    } else {
      fieldType = JsonFieldType.STRING;
    }

    if (!fieldType) {
      throw new Error('Invalid schema');
    }

    const fieldValue = value[field] ?? schema?.properties?.[field]?.default;
    const validator = isRequired ? Validators.required : undefined;

    const control = this._fb.control(fieldValue, validator);

    const meta: JsonFieldMetaData = {
      trackId: `track_${v4()}`,
      key: isAdditional && !field ? this.createTemporaryKey() : field,
      label: field,
      tooltip,
      control,
      fieldType,
      isRequired,
      isAdditional,
      enumItems,
    };

    this.form.addControl(meta.key, control);

    if (isRequired) {
      this.primaryFields.update((list) => list.concat(meta));
    } else {
      this.optionalFields.update((list) => list.concat(meta));
    }

    if (!isRequired && !isAdditional) {
      this.possibleFieldsToAdd.update((list) => list.filter((item) => item !== field));
    }
  }

  private createTemporaryKey(): string {
    return `temp_${v4()}`;
  }

  private terminate(): void {
    this.terminator$?.next();
    this.terminator$?.complete();
    this.terminator$ = undefined;
  }

  private destroyForm(): void {
    this.terminate();
    this.primaryFields.set([]);
    this.optionalFields.set([]);
    const controlNames = Object.keys(this.form.controls);
    controlNames.forEach((controlName) => this.form.removeControl(controlName));
  }

  private setupFormBehavior(): void {
    this.terminator$ = new Subject<void>();
    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe((formValue: JsonFieldGroupValue) => {
        const result = Object.keys(formValue)
          .filter((key) => !key.startsWith('temp_'))
          .reduce((res, key) => {
            res[key] = formValue[key];
            return res;
          }, {} as JsonFieldGroupValue);
        this.lastFormValue = result;
        this.onChange?.(result);
      });
  }

  private assignValueToForm(value: JsonFieldGroupValue): void {
    this.terminate();

    // assign required inputs
    this.primaryFields().forEach((field) => {
      const fieldValue = value[field.key];
      field.control.setValue(fieldValue);
    });

    // add/remove optional inputs
    const fieldsToRemove: JsonFieldMetaData[] = [];
    this.optionalFields().forEach((field) => {
      const fieldValue = value[field.key];
      fieldValue ? field.control.setValue(fieldValue) : fieldsToRemove.push(field);
    });

    fieldsToRemove.forEach((field) => this.removeField(field));

    // add possible new optional inputs
    this.possibleFieldsToAdd()
      .filter((fieldKey) => !!value[fieldKey])
      .forEach((fieldKey) => this.addFieldInternal(this.schema(), fieldKey, value));

    // add new additional inputs
    const formFieldKeys = new Set<string>();
    this.primaryFields().forEach((field) => formFieldKeys.add(field.key));
    this.optionalFields().forEach((field) => formFieldKeys.add(field.key));
    const newAdditionalInputs = Object.keys(value).filter((fieldKey) => !formFieldKeys.has(fieldKey));

    newAdditionalInputs.filter((fieldKey) =>
      this.addFieldInternal(this.schema(), fieldKey, value, { isAdditional: true }),
    );

    this.enableDisableForm();
    this.lastFormValue = value;
    this.setupFormBehavior();
  }

  private buildForm(schema?: JsonFieldsSchema, value: JsonFieldGroupValue = {}): void {
    this.schemaJson = schema ? JSON.stringify(schema) : '';
    this.destroyForm();

    const allSchemaFields = Object.keys(schema?.properties || {});
    const valueFields = Object.keys(value || {});
    const requiredFields = schema?.required || [];
    const nonRequiredFields = allSchemaFields.filter((field) => !requiredFields.includes(field));
    const additionalFields = valueFields.filter((field) => !allSchemaFields.includes(field));

    this.possibleFieldsToAdd.set([...nonRequiredFields]);

    // add required fields
    requiredFields.forEach((field) => this.addFieldInternal(schema!, field, value, { isRequired: true }));

    // for non required and additional fields add only those, which exist in value
    nonRequiredFields
      .filter((field) => valueFields.includes(field))
      .forEach((field) => this.addFieldInternal(schema, field, value));

    additionalFields
      .filter((field) => valueFields.includes(field))
      .forEach((field) => this.addFieldInternal(schema, field, value, { isAdditional: true }));

    this.enableDisableForm();
    this.setupFormBehavior();
  }

  private enableDisableForm(isDisabled?: boolean): void {
    isDisabled = isDisabled ?? this.isDisabled();
    if (isDisabled && this.form.enabled) {
      this.form.disable();
    } else if (!isDisabled && this.form.disabled) {
      this.form.enable();
    }
  }
}
