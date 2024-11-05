import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { SleepArtefact } from '../../types/sleep.artefact';

@Component({
  selector: 'step-sleep-inline',
  templateUrl: './sleep-inline.component.html',
  styleUrl: './sleep-inline.component.scss',
})
export class SleepInlineComponent extends BaseInlineArtefactComponent<SleepArtefact> {
  protected getReportNodeItems = undefined;

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<SleepArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    const sleep = info?.originalArtefact;
    return of(
      this.convert(
        [
          ['Duration', sleep?.duration],
          ['Unit', sleep?.unit],
        ],
        isResolved,
      ),
    );
  }
}
