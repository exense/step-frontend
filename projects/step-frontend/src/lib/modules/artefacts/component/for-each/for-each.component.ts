import { Component, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueInteger,
  DynamicValueString,
} from '@exense/step-core';
import { DataSourceConfigurationArtefact } from '../../shared/data-source-configuration-artefact';
import { NgForm } from '@angular/forms';

interface ForEachArtefact extends DataSourceConfigurationArtefact {
  threads: DynamicValueInteger;
  maxFailedLoops: DynamicValueInteger;
  item: DynamicValueString;
  userItem: DynamicValueString;
  globalCounter: DynamicValueString;
}

@Component({
  selector: 'step-for-each',
  templateUrl: './for-each.component.html',
  styleUrls: ['./for-each.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ForEachComponent extends BaseArtefactComponent<ForEachArtefact> {
  protected showHandles = false;

  @ViewChild('form')
  protected form!: NgForm;
}
