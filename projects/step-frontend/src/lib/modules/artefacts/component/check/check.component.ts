import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { CheckArtefact } from '../../types/check.artefact';

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
