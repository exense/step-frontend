import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArrayItemLabelValueExtractor } from '@exense/step-core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RULES_CONDITION_PREDICATES } from 'step-enterprise-frontend/plugins/step-enterprise-core/src/app/modules/alerting/injectables/rules-condition-predicates.token';
import { RulesFormConditionPredicateType } from 'step-enterprise-frontend/plugins/step-enterprise-core/src/app/modules/alerting/types/rules-form-condition-predicate-type.enum';

interface ParameterConditionDialogData {
  type: string;
  inputs: any[];
}

@Component({
  selector: 'step-parameter-condition-dialog',
  templateUrl: './parameter-condition-dialog.component.html',
  styleUrls: ['./parameter-condition-dialog.component.scss'],
})
export class ParameterConditionDialogComponent implements OnInit {
  private _dialogData = inject<ParameterConditionDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef);

  protected _predicates = inject(RULES_CONDITION_PREDICATES);
  protected _bindingKeys: any[] = ['user'];
  protected _fb = inject(FormBuilder).nonNullable;
  protected bindingKeyExtractor: ArrayItemLabelValueExtractor<string, string> = {
    getValue: (item: string) => item,
    getLabel: (item: string) => item,
  };

  readonly RulesFormConditionPredicateType = RulesFormConditionPredicateType;

  conditionForm!: FormGroup;
  modalTitle: string = '';
  inputs: string[] = [];

  ngOnInit(): void {
    this._dialogData.inputs.forEach((input) => {
      this._bindingKeys.push(input.input.id);
    });

    this.conditionForm = this._fb.group({
      predicate: ['equals', Validators.required],
      key: ['', Validators.required],
      value: ['', Validators.required],
    });

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
  }

  save(): void {
    this.dialogRef.close(this.conditionForm.value);
  }
}
