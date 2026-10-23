import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { ForEachArtefact } from '../../types/for-each.artefact';

@Component({
  selector: 'step-for-each',
  templateUrl: './for-each.component.html',
  styleUrls: ['./for-each.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ForEachComponent extends BaseArtefactComponent<ForEachArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  protected showHandles = false;

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showHandles =
      this._panelDefaults.isNonDefault(artefact?.item, 'row') ||
      this._panelDefaults.isNonDefault(artefact?.userItem, 'userId') ||
      this._panelDefaults.isNonDefault(artefact?.globalCounter, 'gcounter');
  }
}
