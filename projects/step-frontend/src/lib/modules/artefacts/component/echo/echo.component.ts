import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

export interface EchoArtefact extends AbstractArtefact {
  text: DynamicValueString;
}

@Component({
  selector: 'step-echo',
  templateUrl: './echo.component.html',
  styleUrls: ['./echo.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class EchoComponent extends BaseArtefactComponent<EchoArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
