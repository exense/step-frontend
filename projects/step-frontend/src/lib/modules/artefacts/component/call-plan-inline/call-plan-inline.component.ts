import { Component, computed } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueString,
  ReportNode,
} from '@exense/step-core';
import { CallPlanArtefact } from '../../types/call-plan.artefact';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-call-plan-inline',
  templateUrl: './call-plan-inline.component.html',
  styleUrl: './call-plan-inline.component.scss',
})
export class CallPlanInlineComponent extends BaseInlineArtefactComponent<CallPlanArtefact> {
  protected getReportNodeItems = undefined;

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<CallPlanArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const originalArtefact = info?.originalArtefact;
    if (!originalArtefact?.input?.value) {
      return of(undefined);
    }

    let input: Record<string, DynamicValueString> = {};
    try {
      input = JSON.parse(originalArtefact?.input?.value);
    } catch {
      return of(undefined);
    }

    return of(
      this.convert(
        [
          ['Input', undefined],
          ...(Object.entries(input).map(([key, value]) => [key, value]) as [string, DynamicValueString][]),
        ],
        isResolved,
      ),
    );
  }
}
