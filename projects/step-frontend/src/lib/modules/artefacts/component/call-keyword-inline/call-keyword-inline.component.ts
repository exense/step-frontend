import { Component } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { KeywordArtefact } from '../call-keyword/call-keyword.component';
import { Observable, of } from 'rxjs';

interface CallKeywordReportView extends AggregatedArtefactInfo {
  originalArtefact: KeywordArtefact;
}

@Component({
  selector: 'step-call-keyword-inline',
  templateUrl: './call-keyword-inline.component.html',
  styleUrl: './call-keyword-inline.component.scss',
})
export class CallKeywordInlineComponent extends BaseInlineArtefactComponent<CallKeywordReportView> {
  protected getArtefactItems(
    info?: CallKeywordReportView,
    isResolved: boolean = false,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const keywordArgument = info?.originalArtefact?.argument;
    let keywordInputs: Record<string, DynamicValueString> | undefined = undefined;
    try {
      keywordInputs = !!keywordArgument?.value ? JSON.parse(keywordArgument.value) : undefined;
    } catch (err) {}
    if (!keywordInputs) {
      return of(undefined);
    }
    const items = Object.entries(keywordInputs).map(([label, value]) => ({
      label,
      value,
      isResolved,
    }));
    return of(items);
  }
}
