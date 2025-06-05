import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { Synchronized } from '../../types/synchronized.artefact';

@Component({
  selector: 'step-synchronized',
  templateUrl: './synchronized.component.html',
  styleUrls: ['./synchronized.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SynchronizedComponent extends BaseArtefactComponent<Synchronized> {
  @ViewChild('form')
  protected form!: NgForm;
}
