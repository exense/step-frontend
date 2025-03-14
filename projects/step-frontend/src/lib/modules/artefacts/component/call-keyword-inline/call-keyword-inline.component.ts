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
    .extractReportNodeItems((reportNode) => this.getReportNodeInputs(reportNode))
    .extractArtefactItems((artefact) => this.getArtefactInputs(artefact));

  private outputItemsBuilder = this._itemsBuilderService
    .builder<KeywordArtefact, KeywordReportNode>()
    .extractReportNodeItems((reportNode) => this.getReportNodeOutputs(reportNode))
    .extractArtefactItems(() => undefined);

  protected readonly inputItems = computed(() => this.inputItemsBuilder.build(this.currentContext()));

  protected readonly outputItems = computed(() => this.outputItemsBuilder.build(this.currentContext()));

  private getArtefactInputs(artefact?: KeywordArtefact): ArtefactInlineItem[] | undefined {
    const keywordInputs = this.parseParams<DynamicValueString>(artefact?.argument?.value);
    if (!keywordInputs) {
      return undefined;
    }
    const inputs: ArtefactInlineItemSource = Object.entries(keywordInputs).map(([label, value]) => [
      label,
      value,
      'log-in',
      'Input',
    ]);

    return this._artefactInlineUtils.convert(inputs);
  }

  private getReportNodeInputs(reportNode?: KeywordReportNode): ArtefactInlineItem[] | undefined {
    const artefactInputs = this.parseParams<DynamicValueString>(reportNode?.resolvedArtefact?.argument?.value);
    const resolvedInputs = this.parseParams(reportNode?.input);
    if (!resolvedInputs) {
      return undefined;
    }
    const icon = 'log-in';
    const iconTooltip = 'Input';
    const inputValues: ArtefactInlineItemSource = Object.entries(resolvedInputs).map(([label, value]) => {
      const valueExplicitExpression = artefactInputs?.[label]?.expression;
      return {
        label,
        value,
        valueExplicitExpression,
        icon,
        iconTooltip,
      };
    });

    return this._artefactInlineUtils.convert(inputValues);
  }

  private getReportNodeOutputs(reportNode?: KeywordReportNode): ArtefactInlineItem[] | undefined {
    const outputParams = this.parseParams(reportNode?.output);
    if (!outputParams) {
      return undefined;
    }
    const outputValues: ArtefactInlineItemSource = Object.entries(outputParams).map(([key, value]) => [
      key,
      value,
      'log-out',
      'Output',
    ]);
    return this._artefactInlineUtils.convert(outputValues);
  }

  private parseParams<T = string>(params?: string): Record<string, T> | undefined {
    if (!params) {
      return undefined;
    }
    let result: Record<string, T> | undefined;
    try {
      result = JSON.parse(params);
    } catch {
      result = undefined;
    }
    return result;
  }
}
