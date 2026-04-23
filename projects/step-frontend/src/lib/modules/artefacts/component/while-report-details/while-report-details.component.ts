import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
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
        { label: 'condition', value: node.resolvedArtefact.condition, itemType: ItemType.CONFIGURATION },
        { label: 'post condition', value: node.resolvedArtefact.postCondition, itemType: ItemType.CONFIGURATION },
        { label: 'pacing', value: node.resolvedArtefact.pacing, itemType: ItemType.CONFIGURATION },
        { label: 'timeout', value: node.resolvedArtefact.timeout, itemType: ItemType.CONFIGURATION },
        { label: 'max iterations', value: node.resolvedArtefact.maxIterations, itemType: ItemType.CONFIGURATION },
      );
    }

    source.push(
      { label: 'count', value: node.count, itemType: ItemType.RESULT },
      { label: 'error count', value: node.errorCount, itemType: ItemType.RESULT },
    );

    return this._artefactInlineUtils.convert(source);
  });
}
