import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent, ItemType } from '@exense/step-core';
import { ThreadGroupReportNode } from '../../types/thread-group.report-node';

@Component({
  selector: 'step-thread-group-report-details',
  templateUrl: './thread-group-report-details.component.html',
  styleUrl: './thread-group-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ThreadGroupReportDetailsComponent extends BaseReportDetailsComponent<ThreadGroupReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([
      { label: 'threads', value: artefact.users, itemType: ItemType.CONFIGURATION },
      { label: 'pacing', value: artefact.pacing, timeValueUnit: 'ms', itemType: ItemType.CONFIGURATION },
      { label: 'ram up', value: artefact.rampup, timeValueUnit: 'ms', itemType: ItemType.CONFIGURATION },
      { label: 'pack', value: artefact.pack, itemType: ItemType.CONFIGURATION },
      { label: 'start offset', value: artefact.startOffset, timeValueUnit: 'ms', itemType: ItemType.CONFIGURATION },
      { label: 'iterations', value: artefact.iterations, itemType: ItemType.CONFIGURATION },
      { label: 'max duration', value: artefact.maxDuration, timeValueUnit: 'ms', itemType: ItemType.CONFIGURATION },
      { label: 'handle', value: artefact.localItem, itemType: ItemType.CONFIGURATION },
      { label: 'user id variable', value: artefact.userItem, itemType: ItemType.CONFIGURATION },
      { label: 'counter', value: artefact.item, itemType: ItemType.CONFIGURATION },
    ]);
  });
}
