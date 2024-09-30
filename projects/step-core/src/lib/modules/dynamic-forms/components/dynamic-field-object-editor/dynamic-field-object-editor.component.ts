import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, NonNullableFormBuilder } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { v4 } from 'uuid';
import { DynamicValueString } from '../../../../client/generated';
import { DynamicFieldObjectValue } from '../../shared/dynamic-field-group-value';
import { DYNAMIC_FIELD_VALIDATOR } from '../../shared/dynamic-field-validator';
import { DynamicValue } from '../../../../client/augmented/models/dynamic-value-complex-types';
import { ComplexFieldContext } from '../../services/complex-field-context.service';
import {
  JsonFieldMetaData,
  SchemaField,
  JsonFieldsSchema,
  JsonFieldType,
  JsonFieldUtilsService,
  SchemaObjectField,
} from '../../../json-forms';

const DEFAULT_FIELD_VALUE: DynamicValueString = { value: undefined, dynamic: false };

@Component({
  selector: 'step-dynamic-field-object-editor',
  templateUrl: './dynamic-field-object-editor.component.html',
  styleUrls: ['./dynamic-field-object-editor.component.scss'],
})
export class DynamicFieldObjectEditorComponent implements OnChanges, OnDestroy {
  private _fb = inject(FormBuilder);
  private _utils = inject(JsonFieldUtilsService);
  private terminator$?: Subject<void>;

  private readonly formBuilder: NonNullableFormBuilder = this._fb.nonNullable;
  private schemaJson: string = '';

  private lastFormValue?: DynamicFieldObjectValue;

  @Input() primaryFieldsLabel?: string;
  @Input() optionalFieldsLabel?: string;
  @Input() primaryFieldsDescription?: string;
  @Input() optionalFieldsDescription?: string;
  @Input() addFieldBtnLabel?: string;
  @Input() complexObjectTemplate?: TemplateRef<ComplexFieldContext>;
  @Input() complexArrayTemplate?: TemplateRef<ComplexFieldContext>;

  @Input() isDisabled?: boolean;
  @Input() schema?: SchemaObjectField;
  @Input() allowNotSchemaFields: boolean = false;
  @Input() value?: DynamicFieldObjectValue;
  @Output() valueChange = new EventEmitter<DynamicFieldObjectValue | undefined>();

  @Input() isChildNode = false;

  protected primaryFields: JsonFieldMetaData<DynamicValue>[] = [];
  protected optionalFields: JsonFieldMetaData<DynamicValue>[] = [];
  protected form = this.formBuilder.group({});
  protected possibleFieldsToAdd: string[] = [];

  ngOnDestroy(): void {
    this.destroyForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let schemeChanged = false;
    let schema: SchemaObjectField | undefined = undefined;
    let value: DynamicFieldObjectValue | undefined = undefined;

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
    } else if (value && !this.areDynamicFieldObjectsEqual(value, this.lastFormValue)) {
      this.assignValueToForm(value);
    }

    const cIsDisabled = changes['isDisabled'];
    if (cIsDisabled?.currentValue !== cIsDisabled?.previousValue || cIsDisabled?.firstChange) {
      this.enableDisableForm(cIsDisabled?.currentValue);
    }
  }

  private areDynamicFieldObjectsEqual(objectA?: DynamicFieldObjectValue, objectB?: DynamicFieldObjectValue): boolean {
    return this._utils.areObjectsEqual(objectA, objectB, (valueA, valueB) => {
      return !(
        valueA?.dynamic !== valueB?.dynamic ||
        valueA?.value !== valueB?.value ||
        valueA?.expression !== valueB?.expression ||
        valueA?.expressionType !== valueB?.expressionType
      );
    });
  }

  protected updateLabel(field: JsonFieldMetaData<DynamicValue>, label?: string): void {
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

  protected removeField(field: JsonFieldMetaData<DynamicValue>): void {
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

  private buildForm(schema?: JsonFieldsSchema, value?: DynamicFieldObjectValue): void {
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
      .subscribe((formValue: DynamicFieldObjectValue) => {
        //remove temp values
        const result = Object.keys(formValue)
          .filter((key) => !key.startsWith('temp_'))
          .reduce((res, key) => {
            res[key] = formValue[key];
            return res;
          }, {} as DynamicFieldObjectValue);
        this.lastFormValue = result;
        this.valueChange.emit(result);
      });
  }

  private assignValueToForm(value: DynamicFieldObjectValue): void {
    this.terminate();

    // assign required inputs
    this.primaryFields.forEach((field) => {
      const fieldValue = value[field.key] || { ...DEFAULT_FIELD_VALUE };
      field.control.setValue(fieldValue);
    });

    // add/remove optional inputs
    const fieldsToRemove: JsonFieldMetaData<DynamicValue>[] = [];
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
    schema: JsonFieldsSchema | undefined,
    field: string,
    value: DynamicFieldObjectValue = {},
    config?: { isRequired?: boolean; isAdditional?: boolean },
  ): void {
    const isRequired = !!config?.isRequired;
    const isAdditional = !!config?.isAdditional;

    let fieldSchema: SchemaField | undefined;
    let fieldType: JsonFieldType | undefined;
    let tooltip: string | undefined;
    let enumItems: string[] = [];

    if (!isAdditional) {
      const fieldDescription = schema?.properties[field];
      if (!fieldDescription) {
        throw new Error('Invalid schema');
      }
      const params = this._utils.determineFieldMetaParameters(fieldDescription);
      fieldType = params.fieldType;
      fieldSchema = params.fieldSchema;
      tooltip = params.tooltip;
      enumItems = params.enumItems;
    } else {
      fieldType = JsonFieldType.STRING;
    }

    if (!fieldType) {
      throw new Error('Invalid schema');
    }

    const fieldValue: DynamicValue = value[field] || {
      ...DEFAULT_FIELD_VALUE,
    };
    if (fieldValue.value === undefined && value[field] === undefined) {
      fieldValue.value = schema?.properties?.[field]?.default;
    }

    const validator = isRequired ? DYNAMIC_FIELD_VALIDATOR : undefined;
    const control = this.formBuilder.control<DynamicValue>(fieldValue, validator);

    const meta: JsonFieldMetaData<DynamicValue> = {
      trackId: `track_${v4()}`,
      key: isAdditional && !field ? this.createTemporaryKey() : field,
      label: field,
      tooltip,
      control,
      fieldType,
      fieldSchema,
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

  protected readonly JsonFieldType = JsonFieldType;
}
