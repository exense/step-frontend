import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
} from '@exense/step-core';
import { WhileReportNode } from '../../types/while.report-node';

@Component({
  selector: 'step-while-report-details',
  templateUrl: './while-report-details.component.html',
  styleUrl: './while-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WhileReportDetailsComponent extends BaseReportDetailsComponent<WhileReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }
    const source: ArtefactInlineItemSource = [];
    if (node.resolvedArtefact) {
      source.push(
        ['condition', node.resolvedArtefact.condition, 'log-in'],
        ['post condition', node.resolvedArtefact.postCondition, 'log-in'],
        ['pacing', node.resolvedArtefact.pacing, 'log-in'],
        ['timeout', node.resolvedArtefact.timeout, 'log-in'],
        ['max iterations', node.resolvedArtefact.maxIterations, 'log-in'],
      );
    }

    source.push(['count', node.count, 'log-out'], ['error count', node.errorCount, 'log-out']);

    return this._artefactInlineUtils.convert(source);
  });
}
