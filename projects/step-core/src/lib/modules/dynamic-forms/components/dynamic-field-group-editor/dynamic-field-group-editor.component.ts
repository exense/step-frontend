import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { FormBuilder, NonNullableFormBuilder } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { v4 } from 'uuid';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../../client/generated';
import { DynamicFieldGroupValue } from '../../shared/dynamic-field-group-value';
import { DynamicFieldMetaData } from '../../shared/dynamic-field-meta-data';
import { DynamicFieldType } from '../../shared/dynamic-field-type';
import { DYNAMIC_FIELD_VALIDATOR } from '../../shared/dynamic-field-validator';
import { DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';

const DEFAULT_FIELD_VALUE: DynamicValueString = { value: undefined, dynamic: false };

@Component({
  selector: 'step-dynamic-field-group',
  templateUrl: './dynamic-field-group-editor.component.html',
  styleUrls: ['./dynamic-field-group-editor.component.scss'],
})
export class DynamicFieldGroupEditorComponent implements OnChanges, OnDestroy {
  private _fb = inject(FormBuilder);
  private terminator$?: Subject<void>;

  private readonly formBuilder: NonNullableFormBuilder = this._fb.nonNullable;
  private schemaJson: string = '';

  private lastFormValue?: DynamicFieldGroupValue;

  @Input() primaryFieldsLabel?: string;
  @Input() optionalFieldsLabel?: string;
  @Input() primaryFieldsDescription?: string;
  @Input() optionalFieldsDescription?: string;
  @Input() addFieldBtnLabel?: string;

  @Input() isDisabled?: boolean;
  @Input() schema?: DynamicFieldsSchema;
  @Input() allowNotSchemaFields: boolean = false;
  @Input() value?: DynamicFieldGroupValue;
  @Output() valueChange = new EventEmitter<DynamicFieldGroupValue | undefined>();
  protected primaryFields: DynamicFieldMetaData[] = [];
  protected optionalFields: DynamicFieldMetaData[] = [];
  protected form = this.formBuilder.group({});
  protected possibleFieldsToAdd: string[] = [];
  readonly trackByField: TrackByFunction<DynamicFieldMetaData> = (index, item) => item.trackId;

  ngOnDestroy(): void {
    this.destroyForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let schemeChanged = false;
    let schema: DynamicFieldsSchema | undefined = undefined;
    let value: DynamicFieldGroupValue | undefined = undefined;

    const cSchema = changes['schema'];
    const cValue = changes['value'];

    if (cSchema?.currentValue !== cSchema?.previousValue || cSchema?.firstChange) {
      const schemaValue = cSchema?.currentValue;
      const schemaValueJson = !schemaValue ? '' : JSON.stringify(schemaValue);
      schemeChanged = schemaValueJson !== this.schemaJson;
      if (schemeChanged) {
        schema = schemaValue;
      }
    }

    if (cValue?.currentValue !== cValue?.previousValue || cValue?.firstChange) {
      value = cValue?.currentValue;
    }

    if (schemeChanged) {
      this.buildForm(schema, value);
    } else if (value && !this.isFieldGroupValueEqual(value, this.lastFormValue)) {
      this.assignValueToForm(value);
    }

    const cIsDisabled = changes['isDisabled'];
    if (cIsDisabled?.currentValue !== cIsDisabled?.previousValue || cIsDisabled?.firstChange) {
      this.enableDisableForm(cIsDisabled?.currentValue);
    }
  }

  protected updateLabel(field: DynamicFieldMetaData, label: string): void {
    if (field.label === label) {
      return;
    }
    field.label = label;
    const usedKeys = [...this.primaryFields, ...this.optionalFields]
      .filter((input) => input !== field)
      .map((input) => input.key)
      .filter((key) => !key.startsWith('temp_'));

    const newKey = !label || usedKeys.includes(label) ? this.createTemporaryKey() : label;
    this.form.removeControl(field.key);
    field.key = newKey;
    this.form.addControl(field.key, field.control);
  }

  protected addOptionalField(fieldName?: string): void {
    const isAdditional = !fieldName;
    this.addFieldInternal(this.schema, fieldName || '', this.value, { isAdditional });
  }

  protected removeField(field: DynamicFieldMetaData): void {
    const fields = field.isRequired ? this.primaryFields : this.optionalFields;
    const index = fields.indexOf(field);
    if (index < 0) {
      return;
    }
    fields.splice(index, 1);
    this.form.removeControl(field.key);
    if (!field.isRequired && !field.isAdditional) {
      this.possibleFieldsToAdd.push(field.key);
    }
  }

  private destroyForm(): void {
    this.terminate();
    this.primaryFields = [];
    this.optionalFields = [];
    const controlNames = Object.keys(this.form.controls);
    controlNames.forEach((controlName) => this.form.removeControl(controlName));
  }

  private buildForm(schema?: DynamicFieldsSchema, value?: DynamicFieldGroupValue): void {
    schema = schema || this.schema;
    value = value || this.value;
    this.schemaJson = schema ? JSON.stringify(schema) : '';
    this.destroyForm();

    const allSchemaFields = Object.keys(schema?.properties || {});
    const valueFields = Object.keys(value || {});
    const requiredFields = schema?.required || [];
    const nonRequiredFields = allSchemaFields.filter((field) => !requiredFields.includes(field));
    const additionalFields = valueFields.filter((field) => !allSchemaFields.includes(field));

    this.possibleFieldsToAdd = [...nonRequiredFields];

    // add required fields
    requiredFields.forEach((field) => this.addFieldInternal(schema!, field, value, { isRequired: true }));

    // for non required and additional fields add only those, which exist in value
    nonRequiredFields
      .filter((field) => valueFields.includes(field))
      .forEach((field) => this.addFieldInternal(schema, field, value));

    additionalFields
      .filter((field) => valueFields.includes(field))
      .forEach((field) => this.addFieldInternal(schema, field, value, { isAdditional: true }));

    this.enableDisableForm(this.isDisabled);
    this.setupFormBehavior();
  }

  private terminate(): void {
    if (!this.terminator$) {
      return;
    }
    this.terminator$.next();
    this.terminator$.complete();
    this.terminator$ = undefined;
  }

  private setupFormBehavior(): void {
    this.terminator$ = new Subject<void>();

    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe((formValue: DynamicFieldGroupValue) => {
        //remove temp values
        const result = Object.keys(formValue)
          .filter((key) => !key.startsWith('temp_'))
          .reduce((res, key) => {
            res[key] = formValue[key];
            return res;
          }, {} as DynamicFieldGroupValue);
        this.lastFormValue = result;
        this.valueChange.emit(result);
      });
  }

  private assignValueToForm(value: DynamicFieldGroupValue): void {
    this.terminate();

    // assign required inputs
    this.primaryFields.forEach((field) => {
      const fieldValue = value[field.key] || { ...DEFAULT_FIELD_VALUE };
      field.control.setValue(fieldValue);
    });

    // add/remove optional inputs
    const fieldsToRemove: DynamicFieldMetaData[] = [];
    this.optionalFields.forEach((field) => {
      const fieldValue = value[field.key];
      fieldValue ? field.control.setValue(fieldValue) : fieldsToRemove.push(field);
    });

    fieldsToRemove.forEach((field) => this.removeField(field));

    // add possible new optional inputs
    [...this.possibleFieldsToAdd]
      .filter((fieldKey) => !!value[fieldKey])
      .forEach((fieldKey) => this.addFieldInternal(this.schema, fieldKey, value));

    // add new additional inputs
    const formFieldKeys = [...this.primaryFields, ...this.optionalFields].map((field) => field.key);
    const newAdditionalInputs = Object.keys(value).filter((fieldKey) => !formFieldKeys.includes(fieldKey));

    newAdditionalInputs.filter((fieldKey) =>
      this.addFieldInternal(this.schema, fieldKey, value, { isAdditional: true }),
    );

    this.enableDisableForm(this.isDisabled);
    this.lastFormValue = value;
    this.setupFormBehavior();
  }

  private addFieldInternal(
    schema: DynamicFieldsSchema | undefined,
    field: string,
    value: DynamicFieldGroupValue = {},
    config?: { isRequired?: boolean; isAdditional?: boolean },
  ): void {
    const isRequired = !!config?.isRequired;
    const isAdditional = !!config?.isAdditional;

    let fieldType!: DynamicFieldType;
    let enumItems: string[] = [];

    if (!isAdditional) {
      const fieldDescription = schema?.properties[field];
      if (!fieldDescription) {
        throw new Error('Invalid schema');
      }

      if (fieldDescription.enum) {
        fieldType = DynamicFieldType.ENUM;
        enumItems = fieldDescription.enum;
      } else {
        switch (fieldDescription.type) {
          case 'string':
            fieldType = DynamicFieldType.STRING;
            break;
          case 'number':
          case 'integer':
            fieldType = DynamicFieldType.NUMBER;
            break;
          case 'boolean':
            fieldType = DynamicFieldType.BOOLEAN;
            break;
          case 'array':
            fieldType = DynamicFieldType.ARRAY;
            break;
          case 'object':
            fieldType = DynamicFieldType.OBJECT;
            break;
          default:
            break;
        }
      }
    } else {
      fieldType = DynamicFieldType.STRING;
    }

    const fieldValue: DynamicValueString | DynamicValueBoolean | DynamicValueInteger = value[field] || {
      ...DEFAULT_FIELD_VALUE,
    };
    if (fieldValue.value === undefined && value[field] === undefined) {
      fieldValue.value = schema?.properties?.[field]?.default;
    }

    const validator = isRequired ? DYNAMIC_FIELD_VALIDATOR : undefined;
    const control = this.formBuilder.control<DynamicValueString | DynamicValueBoolean | DynamicValueInteger>(
      fieldValue,
      validator,
    );

    if (!fieldType) {
      throw new Error('Invalid schema');
    }

    const meta: DynamicFieldMetaData = {
      trackId: `track_${v4()}`,
      key: isAdditional && !field ? this.createTemporaryKey() : field,
      label: field,
      control,
      fieldType,
      isRequired,
      isAdditional,
      enumItems,
    };
    this.form.addControl(meta.key, control);
    if (isRequired) {
      this.primaryFields.push(meta);
    } else {
      this.optionalFields.push(meta);
    }

    if (!isRequired && !isAdditional) {
      this.possibleFieldsToAdd = this.possibleFieldsToAdd.filter((item) => item !== field);
    }
  }

  private createTemporaryKey(): string {
    return `temp_${v4()}`;
  }

  private enableDisableForm(isDisabled?: boolean): void {
    if (isDisabled && this.form.enabled) {
      this.form.disable();
    } else if (!isDisabled && this.form.disabled) {
      this.form.enable();
    }
  }

  private isFieldGroupValueEqual(valueA?: DynamicFieldGroupValue, valueB?: DynamicFieldGroupValue): boolean {
    if (valueA === valueB) {
      return true;
    }
    if (valueA === undefined || valueB === undefined) {
      return false;
    }
    const keysA = Object.keys(valueA || {});
    const keysB = Object.keys(valueB || {});
    if (keysA.length !== keysB.length) {
      return false;
    }
    const keysEqual = keysA.every((key) => keysB.includes(key));
    if (!keysEqual) {
      return false;
    }

    for (let key of keysA) {
      const fieldA = valueA?.[key];
      const fieldB = valueB?.[key];
      if (
        fieldA?.dynamic !== fieldB?.dynamic ||
        fieldA?.value !== fieldB?.value ||
        fieldA?.expression !== fieldB?.expression ||
        fieldA?.expressionType !== fieldB?.expression
      ) {
        return false;
      }
    }

    return true;
  }
}
