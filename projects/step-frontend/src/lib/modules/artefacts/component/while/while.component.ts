import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueInteger,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface WhileArtefact extends AbstractArtefact {
  condition: DynamicValueString;
  postCondition: DynamicValueString;
  pacing: DynamicValueInteger;
  timeout: DynamicValueInteger;
  maxIterations: DynamicValueInteger;
}

@Component({
  selector: 'step-while',
  templateUrl: './while.component.html',
  styleUrls: ['./while.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class WhileComponent extends BaseArtefactComponent<WhileArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
