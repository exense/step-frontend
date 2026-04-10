import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltReportNodeListSearchDirective } from '../../directives/alt-report-node-list-search.directive';
import { AltReportNodeListItemsPerPageDirective } from '../../directives/alt-report-node-list-items-per-page.directive';
import { AltExecutionDialogsService, OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';

@Component({
  selector: 'step-alt-report-node-testcases-widget',
  templateUrl: './alt-report-node-testcases-widget.component.html',
  styleUrl: './alt-report-node-testcases-widget.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltTestCasesNodesStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesStateService,
    },
  ],
  hostDirectives: [AltReportNodeListSearchDirective, AltReportNodeListItemsPerPageDirective],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeTestcasesWidgetComponent {
  private _executionDialogs = inject(AltExecutionDialogsService);
  protected readonly _mode = inject(VIEW_MODE);

  protected handleOpenIteration({ node, restParams }: OpenIterationsEvent): void {
    this._executionDialogs.openIterations(node, restParams);
  }
}
