import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { IfArtefact } from '../../types/if.artefact';

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
