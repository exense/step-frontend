import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { TestSetArtefact } from '../../types/test-set.artefact';

@Component({
  selector: 'step-test-set',
  templateUrl: './test-set.component.html',
  styleUrls: ['./test-set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class TestSetComponent extends BaseArtefactComponent<TestSetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
