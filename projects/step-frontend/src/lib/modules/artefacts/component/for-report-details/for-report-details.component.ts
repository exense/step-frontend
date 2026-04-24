import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
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
        { label: 'start', value: node.resolvedArtefact.dataSource.start, itemType: ItemType.configuration },
        { label: 'end', value: node.resolvedArtefact.dataSource.end, itemType: ItemType.configuration },
        { label: 'increment', value: node.resolvedArtefact.dataSource.inc, itemType: ItemType.configuration },
        { label: 'threads', value: node.resolvedArtefact.threads, itemType: ItemType.configuration },
        { label: 'max failures', value: node.resolvedArtefact.maxFailedLoops, itemType: ItemType.configuration },
        { label: 'handle', value: node.resolvedArtefact.item, itemType: ItemType.configuration },
        { label: 'user id variable', value: node.resolvedArtefact.userItem, itemType: ItemType.configuration },
        { label: 'counter', value: node.resolvedArtefact.globalCounter, itemType: ItemType.configuration },
      );
    }
    source.push(
      { label: 'count', value: node.count, itemType: ItemType.result },
      { label: 'error count', value: node.errorCount, itemType: ItemType.result },
    );
    return this._artefactInlineUtils.convert(source);
  });
}
