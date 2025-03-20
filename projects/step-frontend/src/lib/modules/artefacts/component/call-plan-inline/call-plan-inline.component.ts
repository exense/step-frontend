import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItem,
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
  DynamicValueString,
} from '@exense/step-core';
import { CallPlanArtefact } from '../../types/call-plan.artefact';

@Component({
  selector: 'step-call-plan-inline',
  templateUrl: './call-plan-inline.component.html',
  styleUrl: './call-plan-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPlanInlineComponent extends BaseInlineArtefactComponent<CallPlanArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _artefactInlineItemBuilder = inject(ArtefactInlineItemsBuilderService);

  private searchCriteriaBuilder = this._artefactInlineItemBuilder
    .builder<CallPlanArtefact>()
    .extractArtefactItems((artefact) => this.getPlanSearchCriteria(artefact));

  private inputsBuilder = this._artefactInlineItemBuilder
    .builder<CallPlanArtefact>()
    .extractArtefactItems((artefact) => this.getPlanInputs(artefact));

  protected readonly items = computed(() => {
    const ctx = this.currentContext();
    const searchCriteriaItems = this.searchCriteriaBuilder.build(ctx) ?? [];
    const inputItems = this.inputsBuilder.build(ctx) ?? [];
    const result = [...searchCriteriaItems, ...inputItems];
    return !result.length ? undefined : result;
  });

  private getPlanInputs(artefact?: CallPlanArtefact): ArtefactInlineItem[] {
    if (!artefact?.input) {
      return [];
    }
    let callPlanInputs: Record<string, DynamicValueString> | undefined = undefined;
    try {
      callPlanInputs = !!artefact?.input?.value ? JSON.parse(artefact.input.value) : {};
    } catch (err) {}
    if (!callPlanInputs) {
      return [];
    }
    const inputs: ArtefactInlineItemSource = Object.entries(callPlanInputs).map(([label, value]) => [
      label,
      value,
      'log-in',
      'Input',
    ]);
    return this._artefactInlineItemUtils.convert(inputs);
  }

  private getPlanSearchCriteria(artefact?: CallPlanArtefact): ArtefactInlineItem[] {
    if (!artefact?.selectionAttributes?.value || artefact?.selectionAttributes?.value === '{}') {
      return [];
    }

    let selectionAttributes: Record<string, DynamicValueString> | undefined = undefined;
    try {
      selectionAttributes = JSON.parse(artefact.selectionAttributes.value);
    } catch (e) {}
    if (!selectionAttributes) {
      return [];
    }
    const searchCriteria: ArtefactInlineItemSource = Object.entries(selectionAttributes).map(([label, value]) => [
      label,
      value,
      'search',
      'Search criteria',
    ]);
    return this._artefactInlineItemUtils.convert(searchCriteria);
  }
}
