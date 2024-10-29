import { Component } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  ReportNodeExt,
} from '@exense/step-core';
import { EchoArtefact } from '../echo/echo.component';
import { Observable, of } from 'rxjs';

interface EchoReportView extends AggregatedArtefactInfo {
  originalArtefact: EchoArtefact;
}

@Component({
  selector: 'step-echo-inline',
  templateUrl: './echo-inline.component.html',
  styleUrl: './echo-inline.component.scss',
})
export class EchoInlineComponent extends BaseInlineArtefactComponent<EchoReportView> {
  protected getReportNodeItems(info?: ReportNodeExt, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    const echo = info?.echo;
    if (!echo) {
      return undefined;
    }
    return [
      {
        label: 'Text',
        value: {
          value: echo,
          dynamic: false,
        },
        isResolved: true,
      },
    ];
  }

  protected getArtefactItems(
    reportView?: EchoReportView,
    isVertical?: boolean,
    isResolved: boolean = false,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const echo = reportView?.originalArtefact;
    if (!echo) {
      return of(undefined);
    }
    return of([
      {
        label: 'Text',
        value: echo.text,
        isResolved,
      },
    ]);
  }
}
