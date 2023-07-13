import { Component, ViewChild } from '@angular/core';
import { AbstractArtefact, ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface EchoArtefact extends AbstractArtefact {
  text: string;
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
