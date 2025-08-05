import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { Synchronized } from '../../types/synchronized.artefact';

@Component({
  selector: 'step-synchronized-inline',
  templateUrl: './synchronized-inline.component.html',
  styleUrl: './synchronized-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SynchronizedInlineComponent extends BaseInlineArtefactComponent<Synchronized> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<Synchronized>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      const itemsSource: ArtefactInlineItemSource = [];
      if (!!artefact.lockName?.dynamic || !!artefact?.lockName.value) {
        itemsSource.push(['lock', artefact.lockName, 'lock']);
      }
      if (!!artefact.globalLock?.dynamic) {
        itemsSource.push(['', artefact.globalLock]);
      } else if (!!artefact.globalLock.value) {
        itemsSource.push(['', 'global']);
      }
      if (!itemsSource.length) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert(itemsSource);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
