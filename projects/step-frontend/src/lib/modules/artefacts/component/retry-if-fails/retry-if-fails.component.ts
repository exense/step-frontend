import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueInteger,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface RetryIfFailsArtefact extends AbstractArtefact {
  maxRetries: DynamicValueInteger;
  gracePeriod: DynamicValueInteger;
  timeout: DynamicValueInteger;
  releaseTokens: DynamicValueBoolean;
  reportLastTryOnly: DynamicValueBoolean;
}

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
