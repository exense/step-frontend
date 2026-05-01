import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
} from '@exense/step-core';
import { RetryIfFailsReportNode } from '../../types/retry-if-fails.report-node';

@Component({
  selector: 'step-retry-if-fails-report-details',
  templateUrl: './retry-if-fails-report-details.component.html',
  styleUrl: './retry-if-fails-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RetryIfFailsReportDetailsComponent extends BaseReportDetailsComponent<RetryIfFailsReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }
    const source: ArtefactInlineItemSource = [];
    const artefact = node?.resolvedArtefact;
    if (artefact) {
      source.push(
        { label: 'max tries', value: artefact.maxRetries, itemType: ItemType.configuration },
        {
          label: 'grace period',
          value: artefact.gracePeriod,
          timeValueUnit: 'ms',
          itemType: ItemType.configuration,
        },
        {
          label: 'timeout',
          value: artefact.timeout,
          timeValueUnit: 'ms',
          itemType: ItemType.configuration,
        },
        { label: 'release token', value: artefact.releaseTokens, itemType: ItemType.configuration },
        { label: 'report last try', value: artefact.reportLastTryOnly, itemType: ItemType.configuration },
      );
    }
    source.push(
      { label: 'tries', value: node.tries, itemType: ItemType.result },
      { label: 'skipped', value: node.skipped, itemType: ItemType.result },
      { label: 'release token', value: node.releasedToken, itemType: ItemType.result },
    );
    return this._artefactInlineUtils.convert(source);
  });
}
