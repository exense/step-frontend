import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { ForArtefact } from '../../types/for.artefact';
import { ForReportNode } from '../../types/for.report-node';

@Component({
  selector: 'step-for-inline',
  templateUrl: './for-inline.component.html',
  styleUrl: './for-inline.component.scss',
})
export class ForInlineComponent extends BaseInlineArtefactComponent<ForArtefact, ForReportNode> {
  protected getItems(
    artefact?: ForArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    return undefined;
  }

  protected override getReportNodeItems(info?: ForReportNode, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    return this.convert([
      ['Count', info?.count],
      ['Error Count', info?.errorCount],
    ]);
  }

  protected override getArtefactItems(
    info?: AggregatedArtefactInfo<ForArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    const dataSource = info?.originalArtefact?.dataSource;
    return of(
      this.convert(
        [
          ['Start', dataSource?.start],
          ['End', dataSource?.end],
          ['Increment', dataSource?.inc],
        ],
        isResolved,
      ),
    );
  }
}
