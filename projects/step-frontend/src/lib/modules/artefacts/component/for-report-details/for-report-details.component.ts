import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
} from '@exense/step-core';
import { ForReportNode } from '../../types/for.report-node';

@Component({
  selector: 'step-for-report-details',
  templateUrl: './for-report-details.component.html',
  styleUrl: './for-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ForReportDetailsComponent extends BaseReportDetailsComponent<ForReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }
    const source: ArtefactInlineItemSource = [];
    if (node.resolvedArtefact) {
      source.push(
        ['start', node.resolvedArtefact.dataSource.start, 'log-in'],
        ['end', node.resolvedArtefact.dataSource.end, 'log-in'],
        ['increment', node.resolvedArtefact.dataSource.inc, 'log-in'],
        ['threads', node.resolvedArtefact.threads, 'log-in'],
        ['max failures', node.resolvedArtefact.maxFailedLoops, 'log-in'],
        ['handle', node.resolvedArtefact.item, 'log-in'],
        ['user id variable', node.resolvedArtefact.userItem, 'log-in'],
        ['counter', node.resolvedArtefact.globalCounter, 'log-in'],
      );
    }
    source.push(['count', node.count, 'log-out'], ['error count', node.errorCount, 'log-out']);
    return this._artefactInlineUtils.convert(source);
  });
}
