import { Component, ViewChild } from '@angular/core';
import { ArtefactFormChangeHelperService, BaseArtefactComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { RetryIfFailsArtefact } from '../../types/retry-if-fails.artefact';

@Component({
  selector: 'step-retry-if-fails',
  templateUrl: './retry-if-fails.component.html',
  styleUrls: ['./retry-if-fails.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class RetryIfFailsComponent extends BaseArtefactComponent<RetryIfFailsArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  protected showAdvancedAttributes = false;
}
