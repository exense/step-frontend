import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ForArtefact } from '../../types/for.artefact';

@Component({
  selector: 'step-for',
  templateUrl: './for.component.html',
  styleUrls: ['./for.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ForComponent extends BaseArtefactComponent<ForArtefact> {
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;
}
