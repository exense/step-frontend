import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

export interface SetArtefact extends AbstractArtefact {
  key: DynamicValueString;
  value: DynamicValueString;
}

@Component({
  selector: 'step-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SetComponent extends BaseArtefactComponent<SetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
