import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { EchoArtefact } from '../../types/echo.artefact';

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
