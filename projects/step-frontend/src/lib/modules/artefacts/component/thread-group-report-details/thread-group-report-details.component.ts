import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent } from '@exense/step-core';
import { ThreadGroupReportNode } from '../../types/thread-group.report-node';

@Component({
  selector: 'step-thread-group-report-details',
  templateUrl: './thread-group-report-details.component.html',
  styleUrl: './thread-group-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreadGroupReportDetailsComponent extends BaseReportDetailsComponent<ThreadGroupReportNode> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    const icon = 'log-in';
    return this._artefactInlineUtils.convert([
      ['threads', artefact.users, icon],
      {
        itemLabel: 'pacing',
        itemValue: artefact.pacing,
        itemTimeValueUnit: 'ms',
        icon,
      },
      {
        itemLabel: 'ram up',
        itemValue: artefact.rampup,
        itemTimeValueUnit: 'ms',
        icon,
      },
      ['pack', artefact.pack, icon],
      {
        itemLabel: 'start offset',
        itemValue: artefact.startOffset,
        itemTimeValueUnit: 'ms',
        icon,
      },
      ['iterations', artefact.iterations, icon],
      {
        itemLabel: 'max duration',
        itemValue: artefact.maxDuration,
        itemTimeValueUnit: 'ms',
        icon,
      },
      ['handle', artefact.localItem, icon],
      ['user id variable', artefact.userItem, icon],
      ['counter', artefact.item, icon],
    ]);
  });
}
