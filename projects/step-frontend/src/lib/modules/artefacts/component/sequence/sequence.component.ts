import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SequenceArtefact } from '../../types/sequence.artefact';

@Component({
  selector: 'step-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SequenceComponent extends BaseArtefactComponent<SequenceArtefact> {
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;
}
