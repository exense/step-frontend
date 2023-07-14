import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface IfArtefact extends AbstractArtefact {
  condition: DynamicValueString;
}

@Component({
  selector: 'step-if',
  templateUrl: './if.component.html',
  styleUrls: ['./if.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class IfComponent extends BaseArtefactComponent<IfArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
