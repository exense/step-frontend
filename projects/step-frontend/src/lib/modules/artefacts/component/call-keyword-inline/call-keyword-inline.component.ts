import { Component } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { KeywordArtefact } from '../../types/keyword.artefact';
import { KeywordReportNode } from '../../types/keyword.report-node';

@Component({
  selector: 'step-call-keyword-inline',
  templateUrl: './call-keyword-inline.component.html',
  styleUrl: './call-keyword-inline.component.scss',
})
export class CallKeywordInlineComponent extends BaseInlineArtefactComponent<KeywordArtefact, KeywordReportNode> {
  protected getReportNodeItems(info?: KeywordReportNode, isVertical?: boolean): ArtefactInlineItem[] | undefined {
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

    const items: [string, string | undefined][] = [];

    if (inputParams) {
      if (isVertical) {
        items.push(['Inputs', undefined]);
      }
      const inputs: [string, string | undefined][] = Object.entries(inputParams).map(([key, value]) => [key, value]);
      items.push(...inputs);
    }
    if (outputParams) {
      if (isVertical) {
        items.push(['Outputs', undefined]);
      }
      const outputs: [string, string | undefined][] = Object.entries(outputParams).map(([key, value]) => [key, value]);
      items.push(...outputs);
    }
    return this.convert(items);
  }

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<KeywordArtefact>,
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
    const inputs: [string, DynamicValueString | undefined][] = Object.entries(keywordInputs).map(([label, value]) => [
      label,
      value,
    ]);

    if (isVertical && inputs.length) {
      inputs.unshift(['Inputs', undefined]);
    }

    return of(this.convert(inputs, isResolved));
  }
}
