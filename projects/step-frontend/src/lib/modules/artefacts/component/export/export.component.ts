import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface ExportArtefact extends AbstractArtefact {
  value: DynamicValueString;
  file: DynamicValueString;
  prefix: DynamicValueString;
  filter: DynamicValueString;
}

@Component({
  selector: 'step-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ExportComponent extends BaseArtefactComponent<ExportArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
