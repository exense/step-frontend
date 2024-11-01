import { Component, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  Keyword,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueString,
  ArtefactFormChangeHelperService,
  JsonFieldsSchema,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

export interface KeywordArtefact extends AbstractArtefact {
  description: string;
  argument: DynamicValueString;
  resultMap: DynamicValueString;
  remote: DynamicValueBoolean;
  token: DynamicValueString;
}

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
  protected schema?: JsonFieldsSchema;

  protected onUpdateKeyword(keyword?: Keyword): void {
    this.keyword = keyword;
    this.schema = keyword?.schema as unknown as JsonFieldsSchema | undefined;
  }
}
