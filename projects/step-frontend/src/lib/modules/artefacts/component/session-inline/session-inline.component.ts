import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { SessionArtefact } from '../../types/session.artefact';

@Component({
  selector: 'step-session-inline',
  templateUrl: './session-inline.component.html',
  styleUrl: './session-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionInlineComponent extends BaseInlineArtefactComponent<SessionArtefact> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<SessionArtefact>()
    .extractArtefactItems((artefact) => {
      const token = artefact?.token;
      if (!token) {
        return undefined;
      }

      let tokenItems: Record<string, DynamicValueString> | undefined = undefined;
      try {
        tokenItems = !!token.value ? JSON.parse(token.value) : {};
      } catch (err) {}
      if (!tokenItems) {
        return undefined;
      }
      const itemsSource: ArtefactInlineItemSource = Object.entries(tokenItems).map(([label, value]) => [label, value]);
      return this._artefactInlineUtils.convert(itemsSource);
    });

  protected items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
