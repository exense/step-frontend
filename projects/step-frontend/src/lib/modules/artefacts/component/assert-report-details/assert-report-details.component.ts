import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
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
  standalone: false,
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
        { label: 'negated', value: node.resolvedArtefact.doNegate, itemType: ItemType.configuration },
        { label: 'actual', value: node.resolvedArtefact.actual, itemType: ItemType.configuration },
        { label: 'operator', value: node.resolvedArtefact.operator, itemType: ItemType.configuration },
        { label: 'expected', value: node.resolvedArtefact.expected, itemType: ItemType.configuration },
      );
    }

    if (!node.error) {
      source.push({ label: 'message', value: node.message, itemType: ItemType.result });
    }

    if (!source.length) {
      return undefined;
    }
    return this._artefactInlineUtils.convert(source);
  });
}
