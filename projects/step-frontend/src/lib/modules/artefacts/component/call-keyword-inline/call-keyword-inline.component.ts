import { Component } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueString,
  ReportNodeExt,
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
  protected getReportNodeItems(info?: ReportNodeExt, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    let inputParams: Record<string, string> | undefined;
    let outputParams: Record<string, string> | undefined;
    try {
      inputParams = info?.input ? JSON.parse(info.input) : undefined;
    } catch {
      inputParams = undefined;
    }
    try {
      outputParams = info?.output ? JSON.parse(info.output) : undefined;
    } catch {
      outputParams = undefined;
    }

    const result: ArtefactInlineItem[] = [];
    if (inputParams) {
      if (isVertical) {
        result.push({ label: 'Inputs' });
      }
      Object.entries(inputParams).forEach(([key, value]) => {
        result.push({
          label: key,
          value: {
            value,
            dynamic: false,
          },
          isResolved: true,
        });
      });
    }
    if (outputParams) {
      if (isVertical) {
        result.push({ label: 'Outputs' });
      }
      Object.entries(outputParams).forEach(([key, value]) => {
        result.push({
          label: key,
          value: {
            value,
            dynamic: false,
          },
          isResolved: true,
        });
      });
    }
    return result;
  }

  protected getArtefactItems(
    info?: CallKeywordReportView,
    isVertical: boolean = false,
    isResolved: boolean = false,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const keywordArgument = info?.originalArtefact?.argument;
    let keywordInputs: Record<string, DynamicValueString> | undefined = undefined;

    try {
      keywordInputs = !!keywordArgument?.value ? JSON.parse(keywordArgument.value) : {};
    } catch (err) {}
    if (!keywordInputs) {
      return of(undefined);
    }
    const inputs = Object.entries(keywordInputs).map(
      ([label, value]) =>
        ({
          label,
          value,
          isResolved,
        }) as ArtefactInlineItem,
    );

    if (!isVertical) {
      return of(!inputs.length ? undefined : inputs);
    }

    if (inputs.length) {
      inputs.unshift({ label: 'Inputs' });
    }

    return of(inputs);
  }
}
