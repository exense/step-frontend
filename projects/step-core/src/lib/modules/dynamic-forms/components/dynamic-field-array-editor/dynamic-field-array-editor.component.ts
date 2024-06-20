import { Component, effect, inject, input, OnDestroy, output, signal, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { DynamicValue, DynamicValueArray } from '../../../../client/step-client-module';
import { DynamicFieldArrayValue } from '../../shared/dynamic-field-group-value';
import { ComplexFieldContext } from '../../services/complex-field-context.service';
import { SchemaField } from '../../shared/dynamic-fields-schema';
import { DynamicFieldMetaData } from '../../shared/dynamic-field-meta-data';
import { DynamicFieldType } from '../../shared/dynamic-field-type';
import { v4 } from 'uuid';
import { DynamicFieldUtilsService } from '../../services/dynamic-field-utils.service';

const DEFAULT_FIELD_VALUE: DynamicValueArray = { value: undefined, dynamic: false };

@Component({
  selector: 'step-dynamic-field-array-editor',
  templateUrl: './dynamic-field-array-editor.component.html',
  styleUrl: './dynamic-field-array-editor.component.scss',
})
export class DynamicFieldArrayEditorComponent implements OnDestroy {
  private _fb = inject(FormBuilder);
  private _fbNonNullable = this._fb.nonNullable;
  private _utils = inject(DynamicFieldUtilsService);

  private terminator$?: Subject<void>;

  private schemaJson = '';
  private lastFormValue?: DynamicFieldArrayValue;

  protected readonly DynamicFieldType = DynamicFieldType;

  /** @Input() **/
  readonly addFieldBtnLabel = input('', {
    transform: (value: string | undefined) => value ?? '',
  });

  /** @Input() **/
  readonly complexObjectTemplate = input<TemplateRef<ComplexFieldContext>>();

  /** @Input() **/
  readonly complexArrayTemplate = input<TemplateRef<ComplexFieldContext>>();

  /** @Input() **/
  readonly isChildNode = input(false);

  /** @Input() **/
  readonly isDisabled = input(false);

  /** @Input() **/
  readonly schema = input<SchemaField | undefined>(undefined);

  /** @Input() **/
  readonly value = input<DynamicFieldArrayValue | undefined>(undefined);

  /** @Output() **/
  readonly valueChange = output<DynamicFieldArrayValue | undefined>();

  protected fields = signal<DynamicFieldMetaData[]>([]);
  protected form = this._fb.group({
    items: this._fbNonNullable.array<DynamicValue>([]),
  });
  private formItems = this.form.controls.items;

  private effDisable = effect(() => this.enableDisableForm(this.isDisabled()));

  private effHandleChanges = effect(
    () => {
      const schema = this.schema();
      const value = this.value();

      const schemaChanged = JSON.stringify(schema) !== this.schemaJson;
      if (schemaChanged) {
        this.buildForm(schema, value);
      } else if (value && !this._utils.areDynamicFieldArraysEqual(value, this.lastFormValue)) {
        this.assignValueToForm(value);
      }
    },
    { allowSignalWrites: true },
  );

  ngOnDestroy(): void {
    this.destroyForm();
  }

  protected addField(): void {
    this.addFieldInternal(this.schema());
  }

  protected removeField(field: DynamicFieldMetaData): void {
    const hasField = this.fields().includes(field);
    if (!hasField) {
      return;
    }
    this.fields.update((fields) => fields.filter((item) => item !== field));
    const formIndex = this.formItems.controls.indexOf(field.control);
    this.formItems.removeAt(formIndex);
  }

  private buildForm(schema?: SchemaField, value: DynamicFieldArrayValue = []): void {
    this.schemaJson = schema ? JSON.stringify(schema) : '';
    this.destroyForm();
    value.forEach((item) => this.addFieldInternal(schema, item));
    this.enableDisableForm(this.isDisabled());
    this.setupFormBehavior();
  }

  private assignValueToForm(value: DynamicFieldArrayValue): void {
    this.terminate();
    const previousLength = this.formItems.length;
    if (value.length < previousLength) {
      // If new value length is lower than previous one
      // remove unnecessary items
      const removeCount = previousLength - value.length;
      const itemsToRemove = this.fields().slice(-removeCount);
      itemsToRemove.forEach((item) => this.removeField(item));
    } else if (value.length > previousLength) {
      // If new value length is greater than previous one
      // add required items
      const addCount = value.length - previousLength;
      for (let i = 0; i < addCount; i++) {
        this.addField();
      }
    }
    this.formItems.setValue(value);
    this.enableDisableForm(this.isDisabled());
    this.lastFormValue = value;
    this.setupFormBehavior();
  }

  private setupFormBehavior(): void {
    this.terminator$ = new Subject<void>();
    this.form.controls.items.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe((formValue: DynamicFieldArrayValue) => {
        this.lastFormValue = formValue;
        this.valueChange.emit(formValue);
      });
  }

  private addFieldInternal(fieldDescription: SchemaField = {}, value?: DynamicValue): void {
    const { fieldSchema, fieldType, enumItems } = this._utils.determineFieldMetaParameters(fieldDescription);

    if (!fieldType) {
      throw new Error('Invalid schema');
    }

    const fieldValue: DynamicValue = value || {
      ...DEFAULT_FIELD_VALUE,
    };
    if (fieldValue.value === undefined && value === undefined) {
      fieldValue.value = fieldDescription.default;
    }

    const control = this._fbNonNullable.control<DynamicValue>(fieldValue);

    const meta: DynamicFieldMetaData = {
      trackId: `track_${v4()}`,
      key: `temp_${v4()}`,
      control,
      fieldType,
      fieldSchema,
      enumItems,
    };

    this.formItems.push(meta.control);
    this.fields.update((fields) => fields.concat(meta));
  }

  private enableDisableForm(isDisabled?: boolean): void {
    if (isDisabled && this.form.enabled) {
      this.form.disable();
    } else if (!isDisabled && this.form.disabled) {
      this.form.enable();
    }
  }

  private destroyForm(): void {
    this.terminate();
    this.fields.set([]);
    this.formItems.clear();
  }

  private terminate(): void {
    this.terminator$?.next();
    this.terminator$?.complete();
    this.terminator$ = undefined;
  }
}
