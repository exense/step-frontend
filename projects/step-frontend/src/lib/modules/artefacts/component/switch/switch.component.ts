import { Component, ViewChild } from '@angular/core';
import { AbstractArtefact, BaseArtefactComponent, DynamicValueString } from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface SwitchArtefact extends AbstractArtefact {
  expression: DynamicValueString;
}

@Component({
  selector: 'step-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent extends BaseArtefactComponent<SwitchArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
