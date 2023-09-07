import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueInteger,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface SequenceArtefact extends AbstractArtefact {
  continueOnError: DynamicValueBoolean;
  pacing: DynamicValueInteger;
}

@Component({
  selector: 'step-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SequenceComponent extends BaseArtefactComponent<SequenceArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  protected showAdvanced = false;
}
