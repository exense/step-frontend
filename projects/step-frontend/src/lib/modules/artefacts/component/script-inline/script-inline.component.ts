import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { ScriptArtefact } from '../../types/script.artefact';

@Component({
  selector: 'step-script-inline',
  templateUrl: './script-inline.component.html',
  styleUrl: './script-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ScriptInlineComponent extends BaseInlineArtefactComponent<ScriptArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<ScriptArtefact>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert([[undefined, artefact.script]]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
