import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { RetryIfFailsArtefact } from '../../types/retry-if-fails.artefact';

@Component({
  selector: 'step-retry-if-fails',
  templateUrl: './retry-if-fails.component.html',
  styleUrls: ['./retry-if-fails.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class RetryIfFailsComponent extends BaseArtefactComponent<RetryIfFailsArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showAdvancedAttributes = false;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showAdvancedAttributes =
      this._panelDefaults.isNonDefault(artefact?.releaseTokens, false) ||
      this._panelDefaults.isNonDefault(artefact?.reportLastTryOnly, false);
  }
}
