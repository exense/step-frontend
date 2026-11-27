import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SessionArtefact } from '../../types/session.artefact';

@Component({
  selector: 'step-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SessionComponent extends BaseArtefactComponent<SessionArtefact> {
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;
}
