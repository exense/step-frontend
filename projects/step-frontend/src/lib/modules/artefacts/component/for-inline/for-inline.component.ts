import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { ForArtefact } from '../for/for.component';
import { Observable, of } from 'rxjs';

export interface ForReportView extends AggregatedArtefactInfo {
  originalArtefact: ForArtefact;
}

@Component({
  selector: 'step-for-inline',
  templateUrl: './for-inline.component.html',
  styleUrl: './for-inline.component.scss',
})
export class ForInlineComponent extends BaseInlineArtefactComponent<ForReportView> {
  protected getArtefactItems(
    info?: ForReportView,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    const dataSource = info?.originalArtefact?.dataSource;
    return of([
      {
        label: 'Start',
        value: dataSource?.start,
        isResolved,
      },
      {
        label: 'End',
        value: dataSource?.end,
        isResolved,
      },
      {
        label: 'Increment',
        value: dataSource?.inc,
        isResolved,
      },
    ]);
  }
}
