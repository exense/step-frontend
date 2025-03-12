import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { WhileArtefact } from '../../types/while.artefact';
import { WhileReportNode } from '../../types/while.report-node';

@Component({
  selector: 'step-while-inline',
  templateUrl: './while-inline.component.html',
  styleUrl: './while-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhileInlineComponent extends BaseInlineArtefactComponent<WhileArtefact, WhileReportNode> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<WhileArtefact, WhileReportNode>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      const source: ArtefactInlineItemSource = [[undefined, artefact.condition]];
      if (artefact.postCondition?.value || artefact.postCondition?.expression) {
        source.push(['post condition', artefact.postCondition]);
      }
      if (artefact.pacing?.value || artefact.pacing?.expression) {
        source.push(['pacing', artefact.pacing]);
      }
      if (artefact.timeout?.value || artefact.timeout?.expression) {
        source.push(['timeout', artefact.timeout]);
      }
      return this._artefactInlineItemUtils.convert(source);
    });

  protected items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
