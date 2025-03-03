import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
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
  selector: 'step-sleep-inline',
  templateUrl: './sleep-inline.component.html',
  styleUrl: './sleep-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SleepInlineComponent extends BaseInlineArtefactComponent<SleepArtefact> {
  private timeUnitDictionary = TIME_UNIT_DICTIONARY as Record<string, TimeUnit>;
  private allowedUnits = Object.values(this.timeUnitDictionary);

  private _converter = inject(TimeConvertersFactoryService).timeConverter();
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SleepArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }

      const items: ArtefactInlineItemSource = [];

      const { duration, unit, releaseTokens } = artefact;
      if (duration.dynamic) {
        items.push([undefined, `${duration.expression}${unit.value}`]);
      } else {
        const measure = !unit?.value
          ? TimeUnit.MILLISECOND
          : this.timeUnitDictionary[unit.value] ?? TimeUnit.MILLISECOND;
        const newMeasure = this._converter.autoDetermineDisplayMeasure(duration.value ?? 0, measure, this.allowedUnits);
        const converted = this._converter.calculateDisplayValue(duration.value ?? 0, measure, newMeasure);
        items.push([undefined, `${converted}${UNITS_DICTIONARY[newMeasure]}`]);
      }

      if (releaseTokens.dynamic) {
        items.push([undefined, releaseTokens]);
      } else if (releaseTokens.value) {
        items.push([undefined, 'release token']);
      }

      return this._artefactInlineUtils.convert(items, isResolved);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
