import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { DataSetArtefact } from '../../types/data-set.artefact';

@Component({
  selector: 'step-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class DataSetComponent extends BaseArtefactComponent<DataSetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
