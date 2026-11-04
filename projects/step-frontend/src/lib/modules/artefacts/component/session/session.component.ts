import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { SessionArtefact } from '../../types/session.artefact';

@Component({
  selector: 'step-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class SessionComponent extends BaseArtefactComponent<SessionArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showTokenSelectionParameters = false;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showTokenSelectionParameters = this._panelDefaults.hasTokenSelectors(artefact?.token);
  }
}
