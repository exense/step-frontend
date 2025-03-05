import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { Synchronized } from '../../types/synchronized.artefact';

@Component({
  selector: 'step-synchronized-report-details',
  templateUrl: './synchronized-report-details.component.html',
  styleUrl: './synchronized-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SynchronizedReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<Synchronized>
> {
  private _artefactService = inject(ArtefactService);

  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    const artefact = node?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }

    const lockName = this._artefactService.convertDynamicValue(artefact.lockName);
    if (artefact.lockName.dynamic || !!lockName) {
      result = result ?? {};
      result['lock'] = lockName;
    }

    if (artefact.globalLock.dynamic) {
      result = result ?? {};
      result['global'] = this._artefactService.convertDynamicValue(artefact.globalLock);
    } else if (artefact.globalLock.value) {
      result = result ?? {};
      result[''] = 'global';
    }

    return result;
  });
}
