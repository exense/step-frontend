import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ReferenceArtefactNameConfig } from '../reference-artefact-name/reference-artefact-name.component';
import { CallPlan, Plan, AugmentedPlansService, DynamicValueString } from '../../client/step-client-module';
import { Observable } from 'rxjs';
import { HintFor } from '../../shared/hint-for.enum';
import { PlanEditorService } from '../../modules/plan-common';

const PLAN_CAPTIONS: ReferenceArtefactNameConfig<CallPlan, Plan>['captions'] = {
  searchReference: 'No plan selected',
  hintFor: HintFor.PLAN,
  dynamicReference: 'Dynamic plan',
  referenceNotFound: 'Plan not found',
  referenceLabel: 'Reference plan',
  editSelectionCriteria: 'Edit Plan selection criteria',
  selectionCriteria: 'Plan selection criteria',
  selectionCriteriaDescription: 'Select a Plan by referencing any of its attributes (i.e. its name)',
  addSelectionCriteriaLabel: 'Add selection criteria',
};

@Component({
  selector: 'step-plan-name',
  templateUrl: './plan-name.component.html',
  styleUrls: ['./plan-name.component.scss'],
  providers: [
    {
      provide: ReferenceArtefactNameConfig,
      useExisting: forwardRef(() => PlanNameComponent),
    },
  ],
  standalone: false,
})
export class PlanNameComponent implements ReferenceArtefactNameConfig<CallPlan, Plan> {
  private _plansApi = inject(AugmentedPlansService);
  protected _planEditorService = inject(PlanEditorService);
  readonly targetExecutionParameters = this._planEditorService.targetExecutionParameters;

  readonly artefactClass = 'CallPlan';

  readonly attributesScreenId = 'plan';

  readonly captions = PLAN_CAPTIONS;

  @Input() isDisabled: boolean = false;
  @Input() artefact?: CallPlan;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() planUpdate = new EventEmitter<Plan | undefined>();

  getSearchAttributes(artefact: CallPlan): DynamicValueString | undefined {
    return artefact!.selectionAttributes;
  }

  lookupReference(artefact: CallPlan): Observable<Plan> {
    return this._plansApi.lookupCallPlanWithBindings({
      callPlan: artefact,
      bindings: this._planEditorService.targetExecutionParameters(),
    });
  }
}
