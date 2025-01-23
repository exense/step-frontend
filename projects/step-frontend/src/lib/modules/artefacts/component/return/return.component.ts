import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ReturnArtefact } from '../../types/return.artefact';

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
