import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
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
      const source: ArtefactInlineItemSource = [
        { label: undefined, value: artefact.dataSource!.start, hideColon: true, margin: '0rem' },
        { label: 'to', value: artefact.dataSource!.end, hideColon: true, margin: '0rem' },
        { label: 'by', value: artefact.dataSource!.inc, hideColon: true, margin: '0rem' },
        ['threads', artefact.threads],
      ];
      if (artefact.maxFailedLoops.value || artefact.maxFailedLoops.expression) {
        source.push(['max failures', artefact.maxFailedLoops]);
      }
      return this._artefactInlineItemUtils.convert(source);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
