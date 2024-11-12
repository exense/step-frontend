import { Component } from '@angular/core';
import {
  AggregatedArtefactInfo,
  ArtefactInlineItem,
  BaseInlineArtefactComponent,
  DynamicValueString,
  ReportNode,
} from '@exense/step-core';
import { AssertPerformanceArtefact } from '../../types/assert-performance.artefact';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-assert-performance-inline',
  templateUrl: './assert-performance-inline.component.html',
  styleUrl: './assert-performance-inline.component.scss',
})
export class AssertPerformanceInlineComponent extends BaseInlineArtefactComponent<AssertPerformanceArtefact> {
  protected getReportNodeItems = undefined;

  protected getArtefactItems(
    info?: AggregatedArtefactInfo<AssertPerformanceArtefact>,
    isVertical?: boolean,
    isResolved?: boolean,
  ): Observable<ArtefactInlineItem[] | undefined> {
    const artefact = info?.originalArtefact;
    if (!artefact) {
      return of(undefined);
    }

    let filters: [string, string | DynamicValueString | undefined][] = [];
    if (artefact.filters?.length) {
      filters = [
        ['Filters:', undefined],
        ...(artefact
          .filters!.map((filter) => [
            ['Filter Type', filter.filterType],
            ['Field', filter.field],
            ['Filter', filter.filter],
          ])
          .flat() as [string, string | DynamicValueString][]),
      ];
    }

    return of(
      this.convert(
        [
          ['Aggregator', artefact.aggregator],
          ['Comparator', artefact.comparator],
          ['Expected Value', artefact.expectedValue],
          ...filters,
        ],
        isResolved,
      ),
    );
  }
}
