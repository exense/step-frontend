import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SwitchArtefact } from '../../types/switch.artefact';

@Component({
  selector: 'step-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SwitchComponent extends BaseArtefactComponent<SwitchArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
