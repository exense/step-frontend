import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueInteger,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

export interface ForArtefact extends AbstractArtefact {
  dataSource: {
    start: DynamicValueInteger;
    end: DynamicValueInteger;
    inc: DynamicValueInteger;
  };
  threads: DynamicValueInteger;
  maxFailedLoops: DynamicValueInteger;
  item: DynamicValueString;
  userItem: DynamicValueString;
  globalCounter: DynamicValueString;
}

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
