import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent, ReportNode } from '@exense/step-core';
import { AssertArtefact } from '../../types/assert.artefact';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-assert-inline',
  templateUrl: './assert-inline.component.html',
  styleUrl: './assert-inline.component.scss',
})
export class AssertInlineComponent extends BaseInlineArtefactComponent<AssertArtefact> {
  protected getReportNodeItems = undefined;

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<AssertArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const assert = info?.originalArtefact;
    if (!assert) {
      return of(undefined);
    }
    return of(
      this.convert(
        [
          ['Actual', assert.actual],
          ['Operator', assert.operator],
          ['Expected', assert.expected],
          ['Negate', assert.doNegate],
          ['Custom Error', assert.customErrorMessage],
        ],
        isResolved,
      ),
    );
  }
}
