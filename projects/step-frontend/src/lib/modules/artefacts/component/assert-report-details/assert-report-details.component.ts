import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
} from '@exense/step-core';
import { AssertReportNode } from '../../types/assert.report-node';

@Component({
  selector: 'step-assert-report-details',
  templateUrl: './assert-report-details.component.html',
  styleUrl: './assert-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssertReportDetailsComponent extends BaseReportDetailsComponent<AssertReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }
    const source: ArtefactInlineItemSource = [];
    if (node.resolvedArtefact) {
      source.push(
        ['negated', node.resolvedArtefact.doNegate, 'log-in'],
        ['actual', node.resolvedArtefact.actual, 'log-in'],
        ['operator', node.resolvedArtefact.operator, 'log-in'],
        ['expected', node.resolvedArtefact.expected, 'log-in'],
      );
    }

    if (!node.error) {
      source.push(['message', node.message, 'log-out']);
    }

    if (!source.length) {
      return undefined;
    }
    return this._artefactInlineUtils.convert(source);
  });
}
