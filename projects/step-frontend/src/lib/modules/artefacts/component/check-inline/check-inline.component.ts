import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { CheckArtefact } from '../../types/check.artefact';

@Component({
  selector: 'step-check-inline',
  templateUrl: './check-inline.component.html',
  styleUrl: './check-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CheckInlineComponent extends BaseInlineArtefactComponent<CheckArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<CheckArtefact>()
    .extractArtefactItems((artefact) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert([[undefined, artefact.expression]]);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
