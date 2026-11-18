import { Component, inject, ViewChild } from '@angular/core';
import {
  Keyword,
  BaseArtefactComponent,
  ArtefactFormChangeHelperService,
  ArtefactPanelDefaultsService,
  JsonFieldsSchema,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { KeywordArtefact } from '../../types/keyword.artefact';

@Component({
  selector: 'step-call-keyword',
  templateUrl: './call-keyword.component.html',
  styleUrls: ['./call-keyword.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class CallKeywordComponent extends BaseArtefactComponent<KeywordArtefact> {
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showTokenSelectionParameters = false;

  protected keyword?: Keyword;
  protected schema?: JsonFieldsSchema;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showTokenSelectionParameters =
      this._panelDefaults.isNonDefault(artefact?.remote, true) ||
      this._panelDefaults.hasTokenSelectors(artefact?.token);
  }

  protected onUpdateKeyword(keyword?: Keyword): void {
    this.keyword = keyword;
    this.schema = keyword?.schema as unknown as JsonFieldsSchema | undefined;
  }
}
