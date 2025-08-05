import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArrayItemLabelValueExtractor } from '@exense/step-core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { valueValidator } from '../../validators/value.validator';
import { Predicate } from '../../types/predicate.enum';
import { ParameterConditionDialogData } from '../../types/parameter-condition.type';
import { KeyValue } from '@angular/common';

type PredicateItem = KeyValue<Predicate, string>;

const createPredicateItem = (key: Predicate, value: string): PredicateItem => ({ key, value });

@Component({
  selector: 'step-parameter-condition-dialog',
  templateUrl: './parameter-condition-dialog.component.html',
  styleUrls: ['./parameter-condition-dialog.component.scss'],
  standalone: false,
})
export class ParameterConditionDialogComponent implements OnInit {
  private _dialogData = inject<ParameterConditionDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef);

  protected Predicate = Predicate;
  protected predicates = [
    createPredicateItem(Predicate.EQUALS, 'equals'),
    createPredicateItem(Predicate.NOT_EQUALS, 'does not equal'),
    createPredicateItem(Predicate.MATCHES, 'matches regex'),
    createPredicateItem(Predicate.NOT_MATCHES, 'does not match regex'),
    createPredicateItem(Predicate.EXISTS, 'exists'),
    createPredicateItem(Predicate.NOT_EXISTS, 'does not exist'),
  ];
  protected yesNoItems: KeyValue<string, string>[] = [
    { key: 'true', value: 'TRUE' },
    { key: 'false', value: 'FALSE' },
  ];

  protected bindingKeys: string[] = ['user'];
  protected _fb = inject(FormBuilder).nonNullable;
  protected bindingKeyExtractor: ArrayItemLabelValueExtractor<string, string> = {
    getValue: (item: string) => item,
    getLabel: (item: string) => item,
  };
  protected _destroyRef = inject(DestroyRef);

  conditionForm!: FormGroup;
  modalTitle: string = '';
  inputs: any[] = [];

  ngOnInit(): void {
    this._dialogData.inputs.forEach((input) => {
      this.bindingKeys.push(input.input.id);
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
  }

  save(): void {
    this.dialogRef.close(this.conditionForm.value);
  }
}
