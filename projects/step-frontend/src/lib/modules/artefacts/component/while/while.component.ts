import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { WhileArtefact } from '../../types/while.artefact';

@Component({
  selector: 'step-while',
  templateUrl: './while.component.html',
  styleUrls: ['./while.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class WhileComponent extends BaseArtefactComponent<WhileArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
