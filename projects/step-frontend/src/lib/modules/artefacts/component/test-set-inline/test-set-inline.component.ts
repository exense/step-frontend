import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { TestSetArtefact } from '../../types/test-set.artefact';

@Component({
  selector: 'step-test-set-inline',
  templateUrl: './test-set-inline.component.html',
  styleUrl: './test-set-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSetInlineComponent extends BaseInlineArtefactComponent<TestSetArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<TestSetArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      return this._artefactInlineItemUtils.convert([['threads', artefact.threads]], isResolved);
    });
  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
