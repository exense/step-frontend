import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { SleepArtefact } from '../sleep/sleep.component';
import { Observable, of } from 'rxjs';

interface SleepReportView extends AggregatedArtefactInfo {
  originalArtefact: SleepArtefact;
}

@Component({
  selector: 'step-sleep-inline',
  templateUrl: './sleep-inline.component.html',
  styleUrl: './sleep-inline.component.scss',
})
export class SleepInlineComponent extends BaseInlineArtefactComponent<SleepReportView> {
  protected getArtefactItems(
    info?: SleepReportView,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    const sleep = info?.originalArtefact;
    return of([
      {
        label: 'Duration',
        value: sleep?.duration,
        isResolved,
      },
      {
        label: 'Unit',
        value: sleep?.unit,
        isResolved,
      },
    ]);
  }
}
