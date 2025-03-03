import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
  TimeConvertersFactoryService,
  TimeUnit,
} from '@exense/step-core';
import { SleepArtefact } from '../../types/sleep.artefact';
import { TIME_UNIT_DICTIONARY } from '../sleep/sleep.component';

const UNITS_DICTIONARY = Object.entries(TIME_UNIT_DICTIONARY).reduce(
  (res, [key, value]) => {
    res[value] = key;
    return res;
  },
  {} as Record<TimeUnit, string>,
);

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
  private timeUnitDictionary = TIME_UNIT_DICTIONARY as Record<string, TimeUnit>;
  private allowedUnits = Object.values(this.timeUnitDictionary);

  private _converter = inject(TimeConvertersFactoryService).timeConverter();

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact) {
      return result;
    }

    const { duration, unit, releaseTokens } = artefact;
    result = {};
    if (duration.dynamic) {
      result['_hidden_sleep'] = `${duration.expression}${unit.value}`;
    } else {
      const measure = !unit?.value ? TimeUnit.MILLISECOND : this.timeUnitDictionary[unit.value] ?? TimeUnit.MILLISECOND;
      const newMeasure = this._converter.autoDetermineDisplayMeasure(duration.value ?? 0, measure, this.allowedUnits);
      const converted = this._converter.calculateDisplayValue(duration.value ?? 0, measure, newMeasure);
      result['_hidden_sleep'] = `${converted}${UNITS_DICTIONARY[newMeasure]}`;
    }

    if (releaseTokens.dynamic) {
      result['releaseToken'] = releaseTokens.expression;
    } else if (releaseTokens.value) {
      result['_hidden_releaseToken'] = 'release token';
    }

    return result;
  });
}
