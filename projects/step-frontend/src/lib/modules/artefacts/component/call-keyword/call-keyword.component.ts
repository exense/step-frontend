import { Component, ViewChild } from '@angular/core';
import {
  Keyword,
  BaseArtefactComponent,
  DynamicFieldsSchema,
  ArtefactFormChangeHelperService,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { KeywordArtefact } from '../../types/keyword.artefact';

@Component({
  selector: 'step-call-keyword',
  templateUrl: './call-keyword.component.html',
  styleUrls: ['./call-keyword.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CallKeywordComponent extends BaseArtefactComponent<KeywordArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  protected showTokenSelectionParameters = false;

  protected keyword?: Keyword;
  protected schema?: DynamicFieldsSchema;

  protected onUpdateKeyword(keyword?: Keyword): void {
    this.keyword = keyword;
    this.schema = keyword?.schema as unknown as DynamicFieldsSchema | undefined;
  }
}
