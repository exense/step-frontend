import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ReferenceArtefactNameConfig } from '../reference-artefact-name/reference-artefact-name.component';
import { CallPlan, Plan, AugmentedPlansService, DynamicValueString } from '../../client/step-client-module';
import { Observable } from 'rxjs';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../shared';

const PLAN_CAPTIONS: ReferenceArtefactNameConfig<CallPlan, Plan>['captions'] = {
  searchReference: 'Select a plan',
  dynamicReference: 'Dynamic plan',
  referenceNotFound: 'Plan not found',
  referenceLabel: 'Reference plan',
  editSelectionCriteria: 'Edit Plan selection criteria',
  selectionCriteria: 'Plan selection criteria',
  selectionCriteriaDescription:
    'The Plan selection criteria are used to reference the Plan. Besides the name any other attribute of the Plan can be referenced.',
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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanName', downgradeComponent({ component: PlanNameComponent }));
