import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArrayItemLabelValueExtractor } from '@exense/step-core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface ParameterConditionDialogData {
  type: string;
  inputs: any[];
}

enum PREDICATE {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  MATCHES = 'matches',
  NOT_MATCHES = 'not_matches',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
}

function valueValidator(control: AbstractControl): ValidationErrors | null {
  const predicate = control.get('predicate')?.value;
  const value = control.get('value')?.value;

  if (predicate != 'exists' && predicate != 'not_exists' && !value) {
    return { valueRequired: true };
  }

  return null;
}

@Component({
  selector: 'step-parameter-condition-dialog',
  templateUrl: './parameter-condition-dialog.component.html',
  styleUrls: ['./parameter-condition-dialog.component.scss'],
})
export class ParameterConditionDialogComponent implements OnInit {
  private _dialogData = inject<ParameterConditionDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef);

  protected PRED = PREDICATE;
  protected _predicates: Array<{ key: string; value: string }> = [
    { key: this.PRED.EQUALS, value: 'equals' },
    { key: this.PRED.NOT_EQUALS, value: 'does not equal' },
    { key: this.PRED.MATCHES, value: 'matches regex' },
    { key: this.PRED.NOT_MATCHES, value: 'does not match regex' },
    { key: this.PRED.EXISTS, value: 'exists' },
    { key: this.PRED.NOT_EXISTS, value: 'does not exist' },
  ];
  protected _bindingKeys: any[] = ['user'];
  protected _fb = inject(FormBuilder).nonNullable;
  protected bindingKeyExtractor: ArrayItemLabelValueExtractor<string, string> = {
    getValue: (item: string) => item,
    getLabel: (item: string) => item,
  };
  protected _destroyRef = inject(DestroyRef);

  conditionForm!: FormGroup;
  modalTitle: string = '';
  inputs: string[] = [];

  filterPredicateControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: Array<{ key: string; value: string }> = [];

  ngOnInit(): void {
    this._dialogData.inputs.forEach((input) => {
      this._bindingKeys.push(input.input.id);
    });

    this.conditionForm = this._fb.group(
      {
        predicate: ['equals', Validators.required],
        key: ['', Validators.required],
        value: [''],
      },
      { validators: valueValidator },
    );

    switch (this._dialogData.type) {
      case 'OR':
        this.modalTitle = 'Add condition connected with OR';
        break;
      case 'AND':
        this.modalTitle = 'Add condition connected with AND';
        break;
      default:
        this.modalTitle = 'Add condition';
    }

    this.dropdownItemsFiltered = [...this._predicates];
    this.filterPredicateControl.valueChanges
      .pipe(
        map((value) => value?.toLowerCase()),
        map((value) =>
          value ? this._predicates.filter((item) => item.value.toLowerCase().includes(value)) : [...this._predicates],
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((displayItemsFiltered) => {
        this.dropdownItemsFiltered = displayItemsFiltered;
      });
  }

  save(): void {
    this.dialogRef.close(this.conditionForm.value);
  }
}
