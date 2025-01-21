import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { CaseArtefact } from '../../types/case.artefact';

@Component({
  selector: 'step-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CaseComponent extends BaseArtefactComponent<CaseArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
