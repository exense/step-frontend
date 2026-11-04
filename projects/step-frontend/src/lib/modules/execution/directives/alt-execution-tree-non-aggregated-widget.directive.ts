import { Directive } from '@angular/core';
import { TreeStateService } from '@exense/step-core';
import { REPORT_NODE_TREE_WIDGET_STATE } from '../services/aggregated-report-view-tree-state.service';

@Directive({
  selector: '[stepAltExecutionTreeNonAggregatedWidget]',
  providers: [
    {
      provide: TreeStateService,
      useExisting: REPORT_NODE_TREE_WIDGET_STATE,
    },
  ],
})
export class AltExecutionTreeNonAggregatedWidgetDirective {}
