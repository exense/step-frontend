import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { EchoArtefact } from '../../types/echo.artefact';
import { EchoReportNode } from '../../types/echo.report-node';

@Component({
  selector: 'step-echo-inline',
  templateUrl: './echo-inline.component.html',
  styleUrl: './echo-inline.component.scss',
})
export class EchoInlineComponent extends BaseInlineArtefactComponent<EchoArtefact, EchoReportNode> {
  protected getItems(
    artefact?: EchoArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    return undefined;
  }

  protected override getReportNodeItems(info?: EchoReportNode, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    const echo = info?.echo;
    if (!echo) {
      return undefined;
    }
    return this.convert([['Text', echo]]);
  }

  protected override getArtefactItems(
    reportView?: AggregatedArtefactInfo<EchoArtefact, EchoReportNode>,
    isVertical?: boolean,
    isResolved: boolean = false,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const echo = reportView?.originalArtefact;
    if (!echo) {
      return of(undefined);
    }
    return of(this.convert([['Text', echo.text]], isResolved));
  }
}
