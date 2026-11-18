import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SequenceArtefact } from '../../types/sequence.artefact';

@Component({
  selector: 'step-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SequenceComponent extends BaseArtefactComponent<SequenceArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showAdvanced = false;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showAdvanced = this._panelDefaults.isNonDefault(artefact?.pacing, 0);
  }
}
