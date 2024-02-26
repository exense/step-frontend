import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ReferenceArtefactNameConfig } from '../reference-artefact-name/reference-artefact-name.component';
import { CallPlan, Plan, AugmentedPlansService, DynamicValueString } from '../../client/step-client-module';
import { Observable } from 'rxjs';

const PLAN_CAPTIONS: ReferenceArtefactNameConfig<CallPlan, Plan>['captions'] = {
  searchReference: 'No plan selected',
  searchHint: 'Click on (pencil icon) to specify selection criteria for any plan',
  dynamicReference: 'Dynamic plan',
  referenceNotFound: 'Plan not found',
  referenceLabel: 'Reference plan',
  editSelectionCriteria: 'Edit Plan selection criteria',
  selectionCriteria: 'Plan selection criteria',
  selectionCriteriaDescription:
    'Selection criteria are used to select a Plan. For this the Plans attribute (i.e. name) has to be referenced.',
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
})
export class PlanNameComponent implements ReferenceArtefactNameConfig<CallPlan, Plan> {
  private _plansApi = inject(AugmentedPlansService);

  readonly artefactClass = 'CallPlan';

  readonly attributesScreenId = 'planTable';

  readonly captions = PLAN_CAPTIONS;

  @Input() isDisabled: boolean = false;
  @Input() artefact?: CallPlan;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() planUpdate = new EventEmitter<Plan | undefined>();

  getSearchAttributes(artefact: CallPlan): DynamicValueString | undefined {
    return artefact!.selectionAttributes;
  }

  lookupReference(artefact: CallPlan): Observable<Plan> {
    return this._plansApi.lookupCallPlan(artefact);
  }
}
