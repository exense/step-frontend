import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface CallPlanArtefact extends AbstractArtefact {
  input: DynamicValueString;
}

@Component({
  selector: 'step-call-plan',
  templateUrl: './call-plan.component.html',
  styleUrls: ['./call-plan.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CallPlanComponent extends BaseArtefactComponent<CallPlanArtefact> {
  @ViewChild('form')
  form!: NgForm;
}
