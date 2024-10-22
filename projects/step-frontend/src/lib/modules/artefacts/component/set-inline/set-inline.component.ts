import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { SetArtefact } from '../set/set.component';

interface SetReportView extends AggregatedArtefactInfo {
  originalArtefact: SetArtefact;
}

@Component({
  selector: 'step-set-inline',
  templateUrl: './set-inline.component.html',
  styleUrl: './set-inline.component.scss',
})
export class SetInlineComponent extends BaseInlineArtefactComponent<SetReportView> {
  protected getArtefactItems(
    info?: SetReportView,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    return of([
      {
        label: 'Key',
        value: info?.originalArtefact.key,
        isResolved,
      },
      {
        label: 'Value',
        value: info?.originalArtefact.value,
        isResolved,
      },
    ]);
  }
}
