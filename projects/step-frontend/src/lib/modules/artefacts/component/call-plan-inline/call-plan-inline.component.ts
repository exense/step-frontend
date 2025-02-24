import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactComponent, DynamicValueString } from '@exense/step-core';
import { CallPlanArtefact } from '../../types/call-plan.artefact';

@Component({
  selector: 'step-call-plan-inline',
  templateUrl: './call-plan-inline.component.html',
  styleUrl: './call-plan-inline.component.scss',
})
export class CallPlanInlineComponent extends BaseInlineArtefactComponent<CallPlanArtefact> {
  protected getItems(
    artefact?: CallPlanArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!artefact?.input?.value) {
      return undefined;
    }
    let input: Record<string, DynamicValueString> = {};
    try {
      input = JSON.parse(artefact?.input?.value);
    } catch {
      return undefined;
    }

    return this.convert(
      [
        ['Input', undefined],
        ...(Object.entries(input).map(([key, value]) => [key, value]) as [string, DynamicValueString][]),
      ],
      isResolved,
    );
  }
}
