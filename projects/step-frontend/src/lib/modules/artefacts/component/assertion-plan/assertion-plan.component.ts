import { Component, ViewChild } from '@angular/core';
import { AbstractArtefact, ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'step-asertion-plan',
  templateUrl: './assertion-plan.component.html',
  styleUrls: ['./assertion-plan.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class AssertionPlanComponent extends BaseArtefactComponent<AbstractArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
