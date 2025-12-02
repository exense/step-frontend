import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { valueRequiredWhenNeededValidator } from '../../validators/value-required-when-needed.validator';
import { Predicate } from '../../types/predicate.enum';
import { ActivationExpressionConditionDialogData } from '../../types/activation-expression-condition.type';
import { KeyValue } from '@angular/common';
import { ArrayItemLabelValueExtractor } from '../../modules/basics/injectables/array-item-label-value-extractor';

type PredicateItem = KeyValue<Predicate, string>;
const createPredicateItem = (key: Predicate, value: string): PredicateItem => ({ key, value });

@Component({
  selector: 'step-activation-expression-wizard-dialog',
  templateUrl: './activation-expression-wizard-dialog.component.html',
  styleUrls: ['./activation-expression-wizard-dialog.component.scss'],
  standalone: false,
})
export class ActivationExpressionWizardDialogComponent implements OnInit {
  private _dialogData = inject<ActivationExpressionConditionDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<string>);
  private _fb = inject(FormBuilder).nonNullable;
  private _destroyRef = inject(DestroyRef);

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
  protected bindingKeyExtractor: ArrayItemLabelValueExtractor<string, string> = {
    getValue: (item: string) => item,
    getLabel: (item: string) => item,
  };

  conditionForm!: FormGroup;
  modalTitle = '';
  inputs: any[] = [];

  ngOnInit(): void {
    this._dialogData.inputs.forEach((input) => {
      this.bindingKeys.push(input.input.id);
      this.inputs.push(input.input);
    });

    this.conditionForm = this._fb.group(
      {
        predicate: [Predicate.EQUALS, Validators.required],
        key: ['', Validators.required],
        value: [''],
      },
      { validators: valueRequiredWhenNeededValidator },
    );

    this.modalTitle =
      this._dialogData.type === 'OR'
        ? 'Add condition connected with OR'
        : this._dialogData.type === 'AND'
          ? 'Add condition connected with AND'
          : 'Add condition';

    this.conditionForm
      .get('key')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.conditionForm.get('value')?.reset());
  }

  save(): void {
    if (this.conditionForm.invalid) return;

    const { key, predicate, value } = this.conditionForm.value as {
      key: string;
      predicate: Predicate;
      value: string;
    };

    const snippet = this.createGroovyExpression({ key, predicate, value });
    const merged = this.mergeWithExisting(this._dialogData.initialScript ?? '', snippet, this._dialogData.type);

    this.dialogRef.close(merged); // return final script string
  }

  private createGroovyExpression({
    key,
    predicate,
    value,
  }: {
    key: string;
    predicate: Predicate;
    value?: string;
  }): string {
    const esc = (s: string | undefined) => (s ?? '').replace(/"/g, '\\"'); // simple quote escaping
    switch (predicate) {
      case Predicate.EQUALS:
        return `${key} == "${esc(value)}"`;
      case Predicate.NOT_EQUALS:
        return `${key} != "${esc(value)}"`;
      case Predicate.MATCHES:
        return `${key} =~ "${esc(value)}"`;
      case Predicate.NOT_MATCHES:
        return `${key} !~ "${esc(value)}"`;
      case Predicate.EXISTS:
        return `${key}`;
      case Predicate.NOT_EXISTS:
        return `!${key}`;
      default:
        return `${key} == "${esc(value)}"`; // fallback
    }
  }

  private mergeWithExisting(existing: string, snippet: string, type?: 'AND' | 'OR'): string {
    const cur = existing.trim();
    if (!cur) return snippet; // first condition
    if (!type) return snippet; // defensive (UI should disable this path)

    const wrap = (expr: string) => {
      const t = expr.trim();
      if (!t) return t;
      return /(\s(?:&&|\|\|)\s)|(^!)/.test(t) ? `(${t})` : t;
    };

    return type === 'AND' ? `${wrap(cur)} && ${wrap(snippet)}` : `${wrap(cur)} || ${wrap(snippet)}`;
  }
}
