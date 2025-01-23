import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent, ReportNode } from '@exense/step-core';
import { CaseArtefact } from '../../types/case.artefact';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-case-inline',
  templateUrl: './case-inline.component.html',
  styleUrl: './case-inline.component.scss',
})
export class CaseInlineComponent extends BaseInlineArtefactComponent<CaseArtefact> {
  protected getReportNodeItems = undefined;
  protected getArtefactItems(
    info?: AggregatedArtefactInfo<CaseArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const artefact = info?.originalArtefact;
    if (!artefact) {
      return of(undefined);
    }
    return of(this.convert([['Value', artefact.value]], isResolved));
  }
}
