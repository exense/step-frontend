import { Component, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueInteger,
  DynamicValueString,
  WaitingArtefactsAdvancedArtefact,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface SleepArtefact extends WaitingArtefactsAdvancedArtefact {
  duration: DynamicValueInteger;
  unit: DynamicValueString;
}

@Component({
  selector: 'step-sleep',
  templateUrl: './sleep.component.html',
  styleUrls: ['./sleep.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SleepComponent extends BaseArtefactComponent<SleepArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
