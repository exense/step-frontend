import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { SetArtefact } from '../../types/set.artefact';
import { SetReportNode } from '../../types/set.report-node';

@Component({
  selector: 'step-set-inline',
  templateUrl: './set-inline.component.html',
  styleUrl: './set-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SetInlineComponent extends BaseInlineArtefactComponent<SetArtefact, SetReportNode> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SetArtefact, SetReportNode>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      const { key, value } = artefact;
      return this._artefactInlineItemUtils.convert([[key, value, 'log-in']]);
    })
    .extractReportNodeItems((reportNode) => {
      if (!reportNode) {
        return undefined;
      }
      const { key: label, value } = reportNode;
      const labelExplicitExpression = reportNode.resolvedArtefact?.key?.expression;
      const valueExplicitExpression = reportNode.resolvedArtefact?.value?.expression;
      const icon = 'log-in';
      return this._artefactInlineItemUtils.convert([
        { label, value, icon, labelExplicitExpression, valueExplicitExpression },
      ]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
