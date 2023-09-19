import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface SessionArtefact extends AbstractArtefact {
  token: DynamicValueString;
}

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
