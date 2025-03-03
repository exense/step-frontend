import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { SequenceArtefact } from '../../types/sequence.artefact';

@Component({
  selector: 'step-sequence-inline',
  templateUrl: './sequence-inline.component.html',
  styleUrl: './sequence-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SequenceInlineComponent extends BaseInlineArtefactComponent<SequenceArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SequenceArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      let itemsSource: ArtefactInlineItemSource | undefined = undefined;

      if (!!artefact.continueOnError?.dynamic || !!artefact.continueOnError?.value) {
        itemsSource = itemsSource ?? [];
        const value = artefact.continueOnError?.dynamic ? artefact.continueOnError : 'continue on error';
        itemsSource.push([undefined, value, 'alert-circle', 'Continue sequence execution on errors in child elements']);
      }

      if (!!artefact.pacing?.dynamic || !!artefact.pacing.value) {
        itemsSource = itemsSource ?? [];
        itemsSource.push(['pacing', artefact.pacing]);
      }

      if (!itemsSource) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert(itemsSource, isResolved);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
