import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { ThreadGroupArtefact } from '../../types/thread-group.artefact';
import { ThreadGroupReportNode } from '../../types/thread-group.report-node';

@Component({
  selector: 'step-thread-group-inline',
  templateUrl: './thread-group-inline.component.html',
  styleUrl: './thread-group-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreadGroupInlineComponent extends BaseInlineArtefactComponent<
  ThreadGroupArtefact,
  ThreadGroupReportNode
> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<ThreadGroupArtefact, ThreadGroupReportNode>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }

      const source: ArtefactInlineItemSource = [
        ['threads', artefact.users],
        {
          label: 'pacing',
          value: artefact.pacing,
          timeValueUnit: 'ms',
        },
      ];

      if (artefact.iterations.expression || artefact.iterations.value) {
        source.push(['iterations', artefact.iterations]);
      }

      if (artefact.maxDuration.expression || artefact.maxDuration.value) {
        source.push({
          label: 'max duration',
          value: artefact.maxDuration,
          timeValueUnit: 'ms',
        });
      }

      return this._artefactInlineItemUtils.convert(source);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
