import { Component, ViewChild } from '@angular/core';
import { Keyword, BaseArtefactComponent, ArtefactFormChangeHelperService, JsonFieldsSchema } from '@exense/step-core';
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
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected keyword?: Keyword;
  protected schema?: JsonFieldsSchema;

  protected onUpdateKeyword(keyword?: Keyword): void {
    this.keyword = keyword;
    this.schema = keyword?.schema as unknown as JsonFieldsSchema | undefined;
  }
}
