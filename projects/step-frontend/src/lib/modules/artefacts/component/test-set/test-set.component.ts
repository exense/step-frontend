import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueInteger,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface TestSetArtefact extends AbstractArtefact {
  threads: DynamicValueInteger;
}

@Component({
  selector: 'step-test-set',
  templateUrl: './test-set.component.html',
  styleUrls: ['./test-set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class TestSetComponent extends BaseArtefactComponent<TestSetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
