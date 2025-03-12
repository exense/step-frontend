import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { IfArtefact } from '../../types/if.artefact';

@Component({
  selector: 'step-if-inline',
  templateUrl: './if-inline.component.html',
  styleUrl: './if-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IfInlineComponent extends BaseInlineArtefactComponent<IfArtefact> {
  private _artefactInlineUtilsService = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<IfArtefact>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineUtilsService.convert([[undefined, artefact.condition]]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
