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
import { PlanEditorService } from '../../modules/plan-common';

const KEYWORD_CAPTIONS: ReferenceArtefactNameConfig<CallFunction, Keyword>['captions'] = {
  searchReference: 'No Keyword selected',
  hintFor: HintFor.KEYWORD,
  dynamicReference: 'Dynamic keyword',
  referenceNotFound: 'Keyword not found',
  referenceLabel: 'Reference keyword',
  editSelectionCriteria: 'Edit Keyword selection criteria',
  selectionCriteria: 'Keyword selection criteria',
  selectionCriteriaDescription: 'Select a Keyword by referencing any of its attributes (i.e. its name)',
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
  standalone: false,
})
export class KeywordNameComponent implements ReferenceArtefactNameConfig<CallFunction, Keyword> {
  private _keywordApi = inject(AugmentedKeywordsService);
  protected _planEditorService = inject(PlanEditorService);
  readonly targetExecutionParameters = this._planEditorService.targetExecutionParameters;

  @Input() isDisabled: boolean = false;
  @Input() artefact?: CallFunction;

  @Output() onSave = new EventEmitter<unknown>();

  @Output() keywordUpdate = new EventEmitter<Keyword | undefined>();

  readonly artefactClass = 'CallKeyword';

  readonly attributesScreenId = 'keyword';

  readonly captions = KEYWORD_CAPTIONS;

  getSearchAttributes(artefact: CallFunction): DynamicValueString | undefined {
    return artefact!.function;
  }

  lookupReference(artefact: AbstractArtefact): Observable<Keyword> {
    return this._keywordApi.lookupCallFunctionWithBindings({
      callFunction: artefact,
      bindings: this._planEditorService.targetExecutionParameters,
    });
  }
}
