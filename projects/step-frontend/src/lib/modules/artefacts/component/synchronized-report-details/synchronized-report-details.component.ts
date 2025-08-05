import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  ArtefactService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { Synchronized } from '../../types/synchronized.artefact';

@Component({
  selector: 'step-synchronized-report-details',
  templateUrl: './synchronized-report-details.component.html',
  styleUrl: './synchronized-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SynchronizedReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<Synchronized>
> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    const artefact = node?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([
      ['lock name', artefact.lockName, 'log-in'],
      ['global lock', artefact.globalLock, 'log-in'],
    ]);
  });
}
