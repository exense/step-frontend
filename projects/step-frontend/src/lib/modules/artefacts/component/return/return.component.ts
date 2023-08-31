import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface ReturnArtefact extends AbstractArtefact {
  output: DynamicValueString;
}

@Component({
  selector: 'step-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ReturnComponent extends BaseArtefactComponent<ReturnArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
