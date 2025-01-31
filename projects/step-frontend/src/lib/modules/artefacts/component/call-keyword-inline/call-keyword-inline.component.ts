import { Component, computed } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
} from '@exense/step-core';
import { KeywordArtefact } from '../../types/keyword.artefact';
import { KeywordReportNode } from '../../types/keyword.report-node';

@Component({
  selector: 'step-call-keyword-inline',
  templateUrl: './call-keyword-inline.component.html',
  styleUrl: './call-keyword-inline.component.scss',
})
export class CallKeywordInlineComponent extends BaseInlineArtefactComponent<KeywordArtefact, KeywordReportNode> {
  protected readonly inputItems = computed(() => {
    const ctx = this.currentContext();
    const aggregated = ctx?.aggregatedInfo;
    const reportNode = ctx?.reportInfo;
    if (aggregated) {
      return this.getAggregatedArtefactInputs(aggregated);
    } else if (reportNode) {
      return this.getReportNodeInfoInputs(reportNode);
    }
    return [];
  });

  protected readonly outputItems = computed(() => {
    const ctx = this.currentContext();
    const reportNode = ctx?.reportInfo;
    if (reportNode) {
      return this.getReportNodeInfoOutputs(reportNode);
    }
    return [];
  });

  protected readonly attachmentsCountTooltip = computed(() => {
    const ctx = this.currentContext();
    const reportNode = ctx?.reportInfo;
    const count = reportNode?.attachments?.length;
    return !count ? undefined : `${count} attachment(s)`;
  });

  protected readonly error = computed(() => {
    const ctx = this.currentContext();
    const reportNode = ctx?.reportInfo;
    return reportNode?.error?.msg;
  });

  private getAggregatedArtefactInputs(
    info?: AggregatedArtefactInfo<KeywordArtefact>,
  ): ArtefactInlineItem[] | undefined {
    if (!info?.originalArtefact) {
      return undefined;
    }
    const isResolved = this.isResolved(info);

    const keywordArgument = info.originalArtefact?.argument;
    let keywordInputs: Record<string, DynamicValueString> | undefined = undefined;

    try {
      keywordInputs = !!keywordArgument?.value ? JSON.parse(keywordArgument.value) : {};
    } catch (err) {}
    if (!keywordInputs) {
      return undefined;
    }
    const inputs: [string, DynamicValueString | undefined][] = Object.entries(keywordInputs).map(([label, value]) => [
      label,
      value,
    ]);

    return this.convert(inputs, isResolved, 'chevron-right', 'Input');
  }

  private getReportNodeInfoInputs(info?: KeywordReportNode): ArtefactInlineItem[] | undefined {
    if (!info?.input) {
      return undefined;
    }
    let inputParams: Record<string, string> | undefined;
    try {
      inputParams = info?.input ? JSON.parse(info.input) : undefined;
    } catch {
      inputParams = undefined;
    }
    if (!inputParams) {
      return undefined;
    }
    const inputValues: [string, string | undefined][] = Object.entries(inputParams).map(([key, value]) => [key, value]);
    return this.convert(inputValues, undefined, 'chevron-right', 'Input');
  }

  private getReportNodeInfoOutputs(info?: KeywordReportNode): ArtefactInlineItem[] | undefined {
    if (!info?.output) {
      return undefined;
    }
    let outputParams: Record<string, string> | undefined;
    try {
      outputParams = info?.output ? JSON.parse(info.output) : undefined;
    } catch {
      outputParams = undefined;
    }
    if (!outputParams) {
      return undefined;
    }
    const outputValues: [string, string | undefined][] = Object.entries(outputParams).map(([key, value]) => [
      key,
      value,
    ]);
    return this.convert(outputValues, undefined, 'chevron-left', 'Output');
  }

  protected getItems(
    artefact?: KeywordArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    return undefined;
  }

  protected override getReportNodeItems(
    info?: KeywordReportNode,
    isVertical?: boolean,
  ): ArtefactInlineItem[] | undefined {
    return [];
  }

  protected override convert(
    items: [
      string,
      string | number | boolean | DynamicValueString | DynamicValueInteger | DynamicValueBoolean | undefined,
    ][],
    isResolved?: boolean,
    icon?: string,
    iconTooltip?: string,
  ): ArtefactInlineItem[] {
    const result = super.convert(items, isResolved);
    return result.map((item) => ({ icon, iconTooltip, ...item }));
  }
}
