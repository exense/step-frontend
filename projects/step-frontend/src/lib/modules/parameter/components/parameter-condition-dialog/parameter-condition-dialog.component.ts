import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArrayItemLabelValueExtractor } from '@exense/step-core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { valueValidator } from '../../validators/value.validator';
import { PREDICATE } from '../../types/predicate.enum';
import { ParameterConditionDialogData } from '../../types/parameter-condition.type';

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
  inputs: any[] = [];

  filterPredicateControl: FormControl<string | null> = new FormControl<string>('');
  filterKeyControl: FormControl<string | null> = new FormControl<string>('');
  filterValueControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: Array<{ key: string; value: string }> = [];
  dropdownKeysFiltered: Array<{ key: string; value: string }> = [];
  dropdownValuesFiltered: Array<{ key: string; value: string }> = [];

  ngOnInit(): void {
    this._dialogData.inputs.forEach((input) => {
      this._bindingKeys.push(input.input.id);
      this.inputs.push(input.input);
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

    this.conditionForm
      .get('key')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.conditionForm.get('value')?.reset();
      });

    this.dropdownKeysFiltered = [...this._bindingKeys];
    this.filterKeyControl.valueChanges
      .pipe(
        startWith(this.filterKeyControl.value),
        map((value) => value?.toLowerCase()),
        map((value) =>
          value ? this._bindingKeys.filter((item) => item.toLowerCase().includes(value)) : [...this._bindingKeys],
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((displayItemsFiltered) => {
        this.dropdownKeysFiltered = displayItemsFiltered;
      });

    this.dropdownItemsFiltered = [...this._predicates];
    this.filterPredicateControl.valueChanges
      .pipe(
        startWith(this.filterPredicateControl.value),
        map((value) => value?.toLowerCase()),
        map((value) =>
          value ? this._predicates.filter((item) => item.value.toLowerCase().includes(value)) : [...this._predicates],
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((displayItemsFiltered) => {
        this.dropdownItemsFiltered = displayItemsFiltered;
      });

    const valuesArray = [
      { key: 'true', value: 'TRUE' },
      { key: 'false', value: 'FALSE' },
    ];
    this.dropdownValuesFiltered = [...valuesArray];
    this.filterValueControl.valueChanges
      .pipe(
        startWith(this.filterValueControl.value),
        map((value) => value?.toLowerCase()),
        map((value) =>
          value ? valuesArray.filter((item) => item.value.toLowerCase().includes(value)) : [...valuesArray],
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((displayItemsFiltered) => {
        this.dropdownValuesFiltered = displayItemsFiltered;
      });
  }

  save(): void {
    this.dialogRef.close(this.conditionForm.value);
  }
}
