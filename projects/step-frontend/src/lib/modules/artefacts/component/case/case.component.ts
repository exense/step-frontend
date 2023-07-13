import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface CaseArtefact extends AbstractArtefact {
  value: DynamicValueString;
}

@Component({
  selector: 'step-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CaseComponent extends BaseArtefactComponent<CaseArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
