import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { distinctUntilChanged, map, shareReplay, startWith, Subject, takeUntil, tap } from 'rxjs';
import { FieldSchemaType } from '../../shared/field-schema-type.enum';
import { numberValidator } from '../../../basics/types/validators/number-validator';
import { booleanValidator } from '../../../basics/types/validators/boolean-validator';
import { jsonValidator } from '../../../basics/types/validators/json-validator';
import { comaSplitArrayValidator } from '../../../basics/types/validators/coma-split-array-validator';
import { MatDialogRef } from '@angular/material/dialog';
import { FieldSchemaMeta } from '../../shared/field-schema-meta.interface';

type DialogRef = MatDialogRef<AddSchemaFieldDialogComponent, FieldSchemaMeta>;

@Component({
  selector: 'step-add-schema-field-dialog',
  templateUrl: './add-schema-field-dialog.component.html',
  styleUrls: ['./add-schema-field-dialog.component.scss'],
})
export class AddSchemaFieldDialogComponent implements OnInit, OnDestroy {
  private _terminator$ = new Subject<void>();
  private _fb = inject(FormBuilder).nonNullable;
  private _dialogRef = inject<DialogRef>(MatDialogRef);

  protected readonly typeItems = Object.values(FieldSchemaType);

  protected readonly errorsDictionary: Record<string, string> = {
    invalidNumber: 'Field should contain a valid numer',
    invalidBoolean: 'Field should contain "true" or "false" value',
    json: 'Filed should contain a valid json object',
    invalidComaSplitArray: 'Field should be a coma split array',
  };

  protected readonly fieldForm = this._fb.group({
    name: this._fb.control('', Validators.required),
    fieldType: this._fb.control<FieldSchemaType | undefined>(undefined, Validators.required),
    isRequired: this._fb.control(false),
    defaultValue: this._fb.control(''),
    enumItems: this._fb.control(''),
  });

  protected readonly fieldType$ = this.fieldForm.controls.fieldType.valueChanges.pipe(
    startWith(this.fieldForm.controls.fieldType.value),
    shareReplay(1),
    takeUntil(this._terminator$),
  );

  protected readonly isEnum$ = this.fieldType$.pipe(map((value) => value === FieldSchemaType.ENUM));
  protected readonly isArray$ = this.fieldType$.pipe(map((value) => value === FieldSchemaType.ARRAY));

  ngOnInit(): void {
    this.setupDynamicValidatorBehavior();
  }

  ngOnDestroy(): void {
    this._terminator$.next();
    this._terminator$.complete();
  }

  @HostListener('keydown.enter')
  protected addField(): void {
    if (this.fieldForm.invalid) {
      this.fieldForm.markAllAsTouched();
      return;
    }
    const { name, fieldType, isRequired } = this.fieldForm.value;
    this._dialogRef.close({
      name: name!,
      type: fieldType!,
      isRequired,
      defaultValue: this.parseDefaultValue(),
      enumItems: this.parseEnumItems(),
    });
  }

  private setupDynamicValidatorBehavior(): void {
    const defaultValueCtrl = this.fieldForm.controls.defaultValue;
    const enumItemsCtrl = this.fieldForm.controls.enumItems;
    this.fieldType$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          defaultValueCtrl.clearValidators();
          enumItemsCtrl.clearValidators();
        }),
      )
      .subscribe((fieldType) => {
        switch (fieldType) {
          case FieldSchemaType.NUMBER:
          case FieldSchemaType.INTEGER:
            defaultValueCtrl.addValidators(numberValidator);
            defaultValueCtrl.updateValueAndValidity();
            break;
          case FieldSchemaType.BOOLEAN:
            defaultValueCtrl.addValidators(booleanValidator);
            defaultValueCtrl.updateValueAndValidity();
            break;
          case FieldSchemaType.OBJECT:
            defaultValueCtrl.addValidators(jsonValidator);
            defaultValueCtrl.updateValueAndValidity();
            break;
          case FieldSchemaType.ARRAY:
            defaultValueCtrl.addValidators(comaSplitArrayValidator);
            defaultValueCtrl.updateValueAndValidity();
            break;
          case FieldSchemaType.ENUM:
            enumItemsCtrl.addValidators(comaSplitArrayValidator);
            enumItemsCtrl.updateValueAndValidity();
            break;
          default:
            break;
        }
      });
  }

  private parseDefaultValue(): any {
    const { fieldType, defaultValue } = this.fieldForm.value;
    if (!defaultValue) {
      return undefined;
    }
    switch (fieldType) {
      case FieldSchemaType.NUMBER:
      case FieldSchemaType.INTEGER:
        const num = parseFloat(defaultValue);
        return isNaN(num) ? undefined : num;
      case FieldSchemaType.BOOLEAN:
        if (defaultValue.toLowerCase().trim() === true.toString()) {
          return true;
        }
        if (defaultValue.toLowerCase().trim() === false.toString()) {
          return false;
        }
        return undefined;
      case FieldSchemaType.OBJECT:
        try {
          return JSON.parse(defaultValue);
        } catch (e) {
          return undefined;
        }
      case FieldSchemaType.ARRAY:
        return defaultValue.split(',');
      default:
        return defaultValue;
    }
  }

  private parseEnumItems(): string[] | undefined {
    const { fieldType, enumItems } = this.fieldForm.value;
    if (fieldType !== FieldSchemaType.ENUM) {
      return undefined;
    }
    return enumItems?.split(',');
  }
}
