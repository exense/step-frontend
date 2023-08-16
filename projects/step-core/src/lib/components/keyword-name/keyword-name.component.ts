import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AbstractArtefact,
  AugmentedKeywordsService,
  CallFunction,
  DynamicValueString,
  Function as Keyword,
} from '../../client/step-client-module';
import { AJS_MODULE } from '../../shared';
import { ReferenceArtefactNameConfig } from '../reference-artefact-name/reference-artefact-name.component';
import { Observable } from 'rxjs';

const KEYWORD_CAPTIONS: ReferenceArtefactNameConfig<CallFunction, Keyword>['captions'] = {
  searchReference: 'Select a keyword',
  dynamicReference: 'Dynamic keyword',
  referenceNotFound: 'Keyword not found',
  referenceLabel: 'Reference keyword',
  editSelectionCriteria: 'Edit Keyword selection criteria',
  selectionCriteria: 'Keyword selection criteria',
  selectionCriteriaDescription:
    'The Keyword selection criteria are used to reference the Keyword. Besides the name any other attribute of the Keyword can be referenced.',
  addSelectionCriteriaLabel: 'Add selection criteria',
};

@Component({
  selector: 'step-keyword-name',
  templateUrl: './keyword-name.component.html',
  styleUrls: ['./keyword-name.component.scss'],
  providers: [
    {
      provide: ReferenceArtefactNameConfig,
      useExisting: forwardRef(() => KeywordNameComponent),
    },
  ],
})
export class KeywordNameComponent implements ReferenceArtefactNameConfig<CallFunction, Keyword> {
  private _keywordApi = inject(AugmentedKeywordsService);

  @Input() isDisabled: boolean = false;
  @Input() artefact?: CallFunction;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() keywordUpdate = new EventEmitter<Keyword | undefined>();

  readonly artefactClass = 'CallKeyword';

  readonly attributesScreenId = 'functionTable';

  readonly captions = KEYWORD_CAPTIONS;

  getSearchAttributes(artefact: CallFunction): DynamicValueString | undefined {
    return artefact!.function;
  }

  lookupReference(artefact: AbstractArtefact): Observable<Keyword> {
    return this._keywordApi.lookupCallFunction(artefact);
  }
}
