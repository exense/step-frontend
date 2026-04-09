import { Directive, effect, inject, output, untracked, viewChild } from '@angular/core';
import { ReportNode, TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../services/aggregated-report-view-tree-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';
import { AltKeywordNodesStateService } from '../services/alt-keyword-nodes-state.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { AggregatedReportViewTreeSearchFacadeService } from '../services/aggregated-report-view-tree-search-facade.service';
import { TREE_SEARCH_DESCRIPTION } from '../services/tree-search-description.token';

@Directive({
  selector: '[stepAltExecutionTreeWidget]',
  providers: [
    {
      provide: TreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
    {
      provide: AggregatedReportViewTreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
    AggregatedReportViewTreeSearchFacadeService,
  ],
})
export class AltExecutionTreeWidgetDirective {
  readonly _treeState = inject(AggregatedReportViewTreeStateService);
  readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION);
  readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);
}
