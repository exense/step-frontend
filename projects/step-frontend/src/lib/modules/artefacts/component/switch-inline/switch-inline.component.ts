import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { SwitchArtefact } from '../../types/switch.artefact';

@Component({
  selector: 'step-switch-inline',
  templateUrl: './switch-inline.component.html',
  styleUrl: './switch-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SwitchInlineComponent extends BaseInlineArtefactComponent<SwitchArtefact> {
  private _artefactInlineUtilsService = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SwitchArtefact>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineUtilsService.convert([[undefined, artefact.expression]]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
