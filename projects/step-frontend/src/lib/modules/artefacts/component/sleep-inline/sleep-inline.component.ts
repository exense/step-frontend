import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
  TimeUnitDictKey,
} from '@exense/step-core';
import { SleepArtefact } from '../../types/sleep.artefact';

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
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SleepArtefact>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }

      const items: ArtefactInlineItemSource = [];

      const { duration, unit, releaseTokens } = artefact;

      items.push({
        value: duration,
        timeValueUnit: unit.value as TimeUnitDictKey,
      });

      if (releaseTokens.dynamic) {
        items.push([undefined, releaseTokens]);
      } else if (releaseTokens.value) {
        items.push([undefined, 'release token']);
      }

      return this._artefactInlineUtils.convert(items);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
