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
  standalone: false,
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
        label: 'pacing',
        value: artefact.pacing,
        timeValueUnit: 'ms',
        icon,
      },
      {
        label: 'ram up',
        value: artefact.rampup,
        timeValueUnit: 'ms',
        icon,
      },
      ['pack', artefact.pack, icon],
      {
        label: 'start offset',
        value: artefact.startOffset,
        timeValueUnit: 'ms',
        icon,
      },
      ['iterations', artefact.iterations, icon],
      {
        label: 'max duration',
        value: artefact.maxDuration,
        timeValueUnit: 'ms',
        icon,
      },
      ['handle', artefact.localItem, icon],
      ['user id variable', artefact.userItem, icon],
      ['counter', artefact.item, icon],
    ]);
  });
}
