import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ForArtefact } from '../../types/for.artefact';

@Component({
  selector: 'step-for',
  templateUrl: './for.component.html',
  styleUrls: ['./for.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ForComponent extends BaseArtefactComponent<ForArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  protected showHandles = false;
}
