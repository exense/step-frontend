import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SessionArtefact } from '../../types/session.artefact';

@Component({
  selector: 'step-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SessionComponent extends BaseArtefactComponent<SessionArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  protected showTokenSelectionParameters = false;
}
