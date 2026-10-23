import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ForArtefact } from '../../types/for.artefact';

@Component({
  selector: 'step-for',
  templateUrl: './for.component.html',
  styleUrls: ['./for.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ForComponent extends BaseArtefactComponent<ForArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showHandles = false;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showHandles =
      this._panelDefaults.isNonDefault(artefact?.item, 'counter') ||
      this._panelDefaults.isNonDefault(artefact?.userItem, 'userId') ||
      this._panelDefaults.isNonDefault(artefact?.globalCounter, 'gcounter');
  }
}
