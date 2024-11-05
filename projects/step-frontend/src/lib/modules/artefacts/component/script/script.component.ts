import { Component, ViewChild } from '@angular/core';
import { AceMode, ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ScriptArtefact } from '../../types/script.artefact';

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
