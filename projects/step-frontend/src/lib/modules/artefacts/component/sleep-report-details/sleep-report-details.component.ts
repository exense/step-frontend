import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  ArtefactService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
  TimeUnitDictKey,
} from '@exense/step-core';
import { SleepArtefact } from '../../types/sleep.artefact';

@Component({
  selector: 'step-sleep-report-details',
  templateUrl: './sleep-report-details.component.html',
  styleUrl: './sleep-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SleepReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<SleepArtefact>> {
  private _artefactInlineService = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }

    const { duration, unit, releaseTokens } = artefact;

    return this._artefactInlineService.convert([
      {
        label: 'sleep',
        value: duration,
        timeValueUnit: unit.value as TimeUnitDictKey,
        icon: 'log-in',
      },
      ['releaseToken', releaseTokens, 'log-in'],
    ]);
  });
}
