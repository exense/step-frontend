import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface CheckArtefact extends AbstractArtefact {
  expression: DynamicValueString;
}

@Component({
  selector: 'step-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CheckComponent extends BaseArtefactComponent<CheckArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
