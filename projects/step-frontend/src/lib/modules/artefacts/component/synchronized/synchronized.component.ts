import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface Synchronized extends AbstractArtefact {
  lockName: DynamicValueString;
  globalLock: DynamicValueBoolean;
}

@Component({
  selector: 'step-synchronized',
  templateUrl: './synchronized.component.html',
  styleUrls: ['./synchronized.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SynchronizedComponent extends BaseArtefactComponent<Synchronized> {
  @ViewChild('form')
  protected form!: NgForm;
}
