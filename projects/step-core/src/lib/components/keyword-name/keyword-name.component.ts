import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import {
  AbstractArtefact,
  AugmentedKeywordsService,
  CallFunction,
  DynamicValueString,
  Keyword,
} from '../../client/step-client-module';
import { ReferenceArtefactNameConfig } from '../reference-artefact-name/reference-artefact-name.component';
import { Observable } from 'rxjs';
import { HintFor } from '../../shared/hint-for.enum';

const KEYWORD_CAPTIONS: ReferenceArtefactNameConfig<CallFunction, Keyword>['captions'] = {
  searchReference: 'No Keyword selected',
  hintFor: HintFor.KEYWORD,
  dynamicReference: 'Dynamic keyword',
  referenceNotFound: 'Keyword not found',
  referenceLabel: 'Reference keyword',
  editSelectionCriteria: 'Edit Keyword selection criteria',
  selectionCriteria: 'Keyword selection criteria',
  selectionCriteriaDescription:
    'Selection criteria are used to select a Keyword. For this the Keywords attribute (i.e. name) has to be referenced.',
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
