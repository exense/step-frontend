import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent, ReportNode } from '@exense/step-core';
import { CheckArtefact } from '../../types/check.artefact';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-check-inline',
  templateUrl: './check-inline.component.html',
  styleUrl: './check-inline.component.scss',
})
export class CheckInlineComponent extends BaseInlineArtefactComponent<CheckArtefact> {
  protected getReportNodeItems = undefined;

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<CheckArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const artefact = info?.originalArtefact;
    if (!artefact) {
      return of(undefined);
    }
    return of(this.convert([['Expression', artefact.expression]], isResolved));
  }
}
