import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ExportArtefact } from '../../types/export.artefact';

@Component({
  selector: 'step-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ExportComponent extends BaseArtefactComponent<ExportArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
