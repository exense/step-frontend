import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ForEachArtefact } from '../../types/for-each.artefact';

@Component({
  selector: 'step-for-each',
  templateUrl: './for-each.component.html',
  styleUrls: ['./for-each.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ForEachComponent extends BaseArtefactComponent<ForEachArtefact> {
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;
}
