import { Directive } from '@angular/core';
import { AggregatedReportViewTreeNodeUtilsService } from '../services/aggregated-report-view-tree-node-utils.service';
import { TreeNodeUtilsService, TreeStateService } from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';
import { AGGREGATED_TREE_NODE_LARGE_VIEW } from '../services/aggregated-tree-node-large-view.token';

@Directive({
  selector: '[stepDrilldownPartialTreeState]',
  providers: [
    AggregatedReportViewTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: AggregatedReportViewTreeNodeUtilsService,
    },
    AggregatedReportViewTreeStateService,
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
    {
      provide: AGGREGATED_TREE_NODE_LARGE_VIEW,
      useValue: false,
    },
  ],
})
export class DrilldownPartialTreeStateDirective {}
