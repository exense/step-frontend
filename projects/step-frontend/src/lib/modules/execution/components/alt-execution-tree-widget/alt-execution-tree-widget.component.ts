import { Component } from '@angular/core';
import { TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';

@Component({
  selector: 'step-alt-execution-tree-widget',
  templateUrl: './alt-execution-tree-widget.component.html',
  styleUrl: './alt-execution-tree-widget.component.scss',
  providers: [
    {
      provide: TreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
    {
      provide: AggregatedReportViewTreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
  ],
})
export class AltExecutionTreeWidgetComponent {}
