import { Component, inject, Input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import {
  AgentTokenSelectionCriteriaForm,
  agentTokenSelectionCriteriaFormCreate,
} from '../../types/agent-token-selection-criteria.form';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-agent-token-selection-criteria',
  templateUrl: './agent-token-selection-criteria.component.html',
  styleUrls: ['./agent-token-selection-criteria.component.scss'],
  imports: [StepBasicsModule],
  standalone: true,
})
export class AgentTokenSelectionCriteriaComponent {
  @Input() tokenSelectionCriteria!: FormArray<AgentTokenSelectionCriteriaForm>;
  @Input() tooltip!: string;

  private _formBuilder = inject(FormBuilder);

  addCriterion(): void {
    const formGroup = agentTokenSelectionCriteriaFormCreate(this._formBuilder);

    this.tokenSelectionCriteria.push(formGroup);
  }

  removeCriterion(index: number): void {
    this.tokenSelectionCriteria.removeAt(index);
  }
}
