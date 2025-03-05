import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
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
})
export class SleepReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<SleepArtefact>> {
  private _artefactService = inject(ArtefactService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact) {
      return result;
    }

    const { duration, unit, releaseTokens } = artefact;

    result = {
      _hidden_sleep: this._artefactService.convertTimeDynamicValue(duration, unit.value as TimeUnitDictKey),
    };

    if (releaseTokens.dynamic) {
      result['releaseToken'] = releaseTokens.expression;
    } else if (releaseTokens.value) {
      result['_hidden_releaseToken'] = 'release token';
    }

    return result;
  });
}
