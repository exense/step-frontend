import { Component } from '@angular/core';
import { AggregatedArtefactInfo, ArtefactInlineItem, BaseInlineArtefactComponent } from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { SetArtefact } from '../../types/set.artefact';
import { SetReportNode } from '../../types/set.report-node';

@Component({
  selector: 'step-set-inline',
  templateUrl: './set-inline.component.html',
  styleUrl: './set-inline.component.scss',
})
export class SetInlineComponent extends BaseInlineArtefactComponent<SetArtefact, SetReportNode> {
  protected getItems(
    artefact?: SetArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    return undefined;
  }

  protected override getReportNodeItems(info?: SetReportNode, isVertical?: boolean): ArtefactInlineItem[] | undefined {
    if (!info?.key) {
      return undefined;
    }
    return this.convert([
      ['Key', info?.key],
      ['Value', info?.value],
    ]);
  }

  protected override getArtefactItems(
    info?: AggregatedArtefactInfo<SetArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[]> {
    return of(
      this.convert(
        [
          ['Key', info?.originalArtefact!.key],
          ['Value', info?.originalArtefact!.value],
        ],
        isResolved,
      ),
    );
  }
}
