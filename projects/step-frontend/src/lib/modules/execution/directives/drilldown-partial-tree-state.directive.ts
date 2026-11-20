import { Directive } from '@angular/core';
import { AggregatedReportViewTreeNodeUtilsService } from '../services/aggregated-report-view-tree-node-utils.service';
import { treeStateFactoryProvider, TreeStateService } from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeSearchFacadeService } from '../services/aggregated-report-view-tree-search-facade.service';

@Directive({
  selector: '[stepDrilldownPartialTreeState]',
  providers: [
    {
      provide: AggregatedReportViewTreeStateService,
      useFactory: treeStateFactoryProvider(
        AggregatedReportViewTreeStateService,
        AggregatedReportViewTreeNodeUtilsService,
      ),
    },
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
    AggregatedReportViewTreeSearchFacadeService,
  ],
})
export class DrilldownPartialTreeStateDirective {}
