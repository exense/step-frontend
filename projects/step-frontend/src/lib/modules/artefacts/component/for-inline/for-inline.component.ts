import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { ForArtefact } from '../../types/for.artefact';
import { ForReportNode } from '../../types/for.report-node';

@Component({
  selector: 'step-for-inline',
  templateUrl: './for-inline.component.html',
  styleUrl: './for-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForInlineComponent extends BaseInlineArtefactComponent<ForArtefact, ForReportNode> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<ForArtefact, ForReportNode>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert([
        [undefined, artefact.dataSource!.start],
        ['to', artefact.dataSource!.end],
        ['by', artefact.dataSource!.inc],
        ['threads', artefact.threads],
        ['max failures', artefact.maxFailedLoops],
      ]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
