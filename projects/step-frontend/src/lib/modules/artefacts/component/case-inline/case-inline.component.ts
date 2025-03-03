import { Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { CaseArtefact } from '../../types/case.artefact';

@Component({
  selector: 'step-case-inline',
  templateUrl: './case-inline.component.html',
  styleUrl: './case-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
})
export class CaseInlineComponent extends BaseInlineArtefactComponent<CaseArtefact> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<CaseArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineUtils.convert([[undefined, artefact.value]], isResolved);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
