import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
  DynamicValueString,
  ItemType,
} from '@exense/step-core';
import { ReturnArtefact } from '../../types/return.artefact';

@Component({
  selector: 'step-return-inline',
  templateUrl: './return-inline.component.html',
  styleUrl: './return-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReturnInlineComponent extends BaseInlineArtefactComponent<ReturnArtefact> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<ReturnArtefact>()
    .extractArtefactItems((artefact) => {
      const output = artefact?.output;
      if (!output) {
        return undefined;
      }

      let returnOutputs: Record<string, DynamicValueString> | undefined = undefined;
      try {
        returnOutputs = !!output.value ? JSON.parse(output.value) : {};
      } catch (error) {}
      if (!returnOutputs) {
        return undefined;
      }

      const outputs = Object.entries(returnOutputs).map(([label, value]) => ({
        label,
        value,
        itemType: ItemType.RESULT,
      }));

      return this._artefactInlineUtils.convert(outputs);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
