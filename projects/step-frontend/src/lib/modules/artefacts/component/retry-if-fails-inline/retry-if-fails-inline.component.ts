import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { RetryIfFailsArtefact } from '../../types/retry-if-fails.artefact';
import { RetryIfFailsReportNode } from '../../types/retry-if-fails.report-node';

@Component({
  selector: 'step-retry-if-fails-inline',
  templateUrl: './retry-if-fails-inline.component.html',
  styleUrl: './retry-if-fails-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetryIfFailsInlineComponent extends BaseInlineArtefactComponent<
  RetryIfFailsArtefact,
  RetryIfFailsReportNode
> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<RetryIfFailsArtefact, RetryIfFailsReportNode>()
    .extractReportNodeItems((reportNode, isResolved) => {
      if (!reportNode) {
        return undefined;
      }
      const artefact = reportNode.resolvedArtefact!;
      const source: ArtefactInlineItemSource = [
        {
          itemLabel: 'tries',
          itemValue: reportNode.tries,
          isValueFirst: true,
        },
        {
          itemLabel: 'max',
          itemValue: artefact.maxRetries,
          isValueFirst: true,
          prefix: '(',
          suffix: ')',
        },
        ['skipped', reportNode.skipped],
      ];
      source.push(...this.timeFields(artefact));
      return this._artefactInlineItemUtils.convert(source, isResolved);
    })
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      const source: ArtefactInlineItemSource = [
        {
          itemLabel: 'max tries',
          itemValue: artefact.maxRetries,
        },
      ];
      source.push(...this.timeFields(artefact));
      return this._artefactInlineItemUtils.convert(source, isResolved);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));

  private timeFields(artefact: RetryIfFailsArtefact): ArtefactInlineItemSource {
    const result: ArtefactInlineItemSource = [];
    if (artefact.gracePeriod.value || artefact.gracePeriod.expression) {
      result.push({
        itemLabel: 'grace period',
        itemValue: artefact.gracePeriod,
        itemTimeValueUnit: 'ms',
      });
    }
    if (artefact.timeout.value || artefact.timeout.expression) {
      result.push({
        itemLabel: 'timeout',
        itemValue: artefact.timeout,
        itemTimeValueUnit: 'ms',
      });
    }
    return result;
  }
}
