import { Component, ViewChild } from '@angular/core';
import { AbstractArtefact, AceMode, ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface ScriptArtefact extends AbstractArtefact {
  script: string;
}

@Component({
  selector: 'step-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ScriptComponent extends BaseArtefactComponent<ScriptArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  readonly AceMode = AceMode;
}
