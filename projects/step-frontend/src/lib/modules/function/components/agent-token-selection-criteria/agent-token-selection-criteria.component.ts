import { Component, inject, Input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import {
  AgentTokenSelectionCriterionForm,
  agentTokenSelectionCriterionFormCreate,
} from '../../types/agent-token-selection-criterion.form';

@Component({
  selector: 'step-agent-token-selection-criteria',
  templateUrl: './agent-token-selection-criteria.component.html',
  styleUrls: ['./agent-token-selection-criteria.component.scss'],
})
export class AgentTokenSelectionCriteriaComponent {
  @Input() tokenSelectionCriteria!: FormArray<AgentTokenSelectionCriterionForm>;
  @Input() tooltip!: string;

  private _formBuilder = inject(FormBuilder);

  addCriterion(): void {
    const formGroup = agentTokenSelectionCriterionFormCreate(this._formBuilder);

    this.tokenSelectionCriteria.push(formGroup);
  }

  removeCriterion(index: number): void {
    this.tokenSelectionCriteria.removeAt(index);
  }
}
