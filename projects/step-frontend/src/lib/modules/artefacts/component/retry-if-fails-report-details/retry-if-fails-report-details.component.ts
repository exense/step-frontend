import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
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
    const icon = 'log-in';
    const outputIcon = 'log-out';
    if (artefact) {
      source.push(
        ['max tries', artefact.maxRetries, icon],
        {
          label: 'grace period',
          value: artefact.gracePeriod,
          timeValueUnit: 'ms',
          icon,
        },
        {
          label: 'timeout',
          value: artefact.timeout,
          timeValueUnit: 'ms',
          icon,
        },
        ['release token', artefact.releaseTokens, icon],
        ['report last try', artefact.reportLastTryOnly, icon],
      );
    }
    source.push(
      ['tries', node.tries, outputIcon],
      ['skipped', node.skipped, outputIcon],
      ['release token', node.releasedToken, outputIcon],
    );
    return this._artefactInlineUtils.convert(source);
  });
}
