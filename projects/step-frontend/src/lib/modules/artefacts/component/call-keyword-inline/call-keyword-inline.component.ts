import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItem,
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { KeywordArtefact } from '../../types/keyword.artefact';
import { KeywordReportNode } from '../../types/keyword.report-node';

@Component({
  selector: 'step-call-keyword-inline',
  templateUrl: './call-keyword-inline.component.html',
  styleUrl: './call-keyword-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallKeywordInlineComponent extends BaseInlineArtefactComponent<KeywordArtefact, KeywordReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilderService = inject(ArtefactInlineItemsBuilderService);

  private inputItemsBuilder = this._itemsBuilderService
    .builder<KeywordArtefact, KeywordReportNode>()
    .extractReportNodeItems((reportNode, isResolved) => this.getReportNodeInputs(reportNode, isResolved))
    .extractArtefactItems((artefact, isResolved) => this.getArtefactInputs(artefact, isResolved));

  private outputItemsBuilder = this._itemsBuilderService
    .builder<KeywordArtefact, KeywordReportNode>()
    .extractReportNodeItems((reportNode, isResolved) => this.getReportNodeOutputs(reportNode, isResolved))
    .extractArtefactItems(() => undefined);

  protected readonly inputItems = computed(() => this.inputItemsBuilder.build(this.currentContext()));

  protected readonly outputItems = computed(() => this.outputItemsBuilder.build(this.currentContext()));

  private getArtefactInputs(artefact?: KeywordArtefact, isResolved?: boolean): ArtefactInlineItem[] | undefined {
    if (!artefact?.argument) {
      return undefined;
    }
    const keywordArgument = artefact.argument;
    let keywordInputs: Record<string, DynamicValueString> | undefined = undefined;

    try {
      keywordInputs = !!keywordArgument?.value ? JSON.parse(keywordArgument.value) : {};
    } catch (err) {}
    if (!keywordInputs) {
      return undefined;
    }
    const inputs: ArtefactInlineItemSource = Object.entries(keywordInputs).map(([label, value]) => [
      label,
      value,
      'log-in',
      'Input',
    ]);

    return this._artefactInlineUtils.convert(inputs, isResolved);
  }

  private getReportNodeInputs(reportNode?: KeywordReportNode, isResolved?: boolean): ArtefactInlineItem[] | undefined {
    if (!reportNode?.input) {
      return undefined;
    }
    let inputParams: Record<string, string> | undefined;
    try {
      inputParams = reportNode?.input ? JSON.parse(reportNode.input) : undefined;
    } catch {
      inputParams = undefined;
    }
    if (!inputParams) {
      return undefined;
    }
    const inputValues: ArtefactInlineItemSource = Object.entries(inputParams).map(([key, value]) => [
      key,
      value,
      'log-in',
      'Input',
    ]);

    return this._artefactInlineUtils.convert(inputValues, isResolved);
  }

  private getReportNodeOutputs(reportNode?: KeywordReportNode, isResolved?: boolean): ArtefactInlineItem[] | undefined {
    if (!reportNode?.output) {
      return undefined;
    }
    let outputParams: Record<string, string> | undefined;
    try {
      outputParams = reportNode?.output ? JSON.parse(reportNode.output) : undefined;
    } catch {
      outputParams = undefined;
    }
    if (!outputParams) {
      return undefined;
    }
    const outputValues: ArtefactInlineItemSource = Object.entries(outputParams).map(([key, value]) => [
      key,
      value,
      'log-out',
      'Output',
    ]);
    return this._artefactInlineUtils.convert(outputValues, isResolved);
  }
}
