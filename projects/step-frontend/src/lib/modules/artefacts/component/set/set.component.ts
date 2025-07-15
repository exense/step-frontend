import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SetArtefact } from '../../types/set.artefact';

@Component({
  selector: 'step-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SetComponent extends BaseArtefactComponent<SetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
