import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItem,
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { AssertArtefact } from '../../types/assert.artefact';
import { AssertReportNode } from '../../types/assert.report-node';

@Component({
  selector: 'step-assert-inline',
  templateUrl: './assert-inline.component.html',
  styleUrl: './assert-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssertInlineComponent extends BaseInlineArtefactComponent<AssertArtefact, AssertReportNode> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<AssertArtefact, AssertReportNode>()
    .extractReportNodeItems((reportNode) => {
      if (reportNode?.error) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert([[undefined, reportNode?.message ?? '']]);
    })
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      const source: ArtefactInlineItemSource = [
        ['actual', artefact.actual],
        ['operator', artefact.operator],
        ['expected', artefact.expected],
      ];
      if (artefact.doNegate.expression || artefact.doNegate.value) {
        source.unshift(['negated', artefact.doNegate]);
      }
      return this._artefactInlineItemUtils.convert(source);
    });

  protected items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
