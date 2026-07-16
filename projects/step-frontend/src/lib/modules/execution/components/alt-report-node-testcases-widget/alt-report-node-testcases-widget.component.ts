import { Component, inject, ViewEncapsulation } from '@angular/core';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltExecutionDialogsService, OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { AltReportNodeListProvideTestcasesDirective } from '../../directives/alt-report-node-list-provide-testcases.directive';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';

@Component({
  selector: 'step-alt-report-node-testcases-widget',
  templateUrl: './alt-report-node-testcases-widget.component.html',
  styleUrl: './alt-report-node-testcases-widget.component.scss',
  hostDirectives: [AltReportNodeListProvideTestcasesDirective],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeTestcasesWidgetComponent {
  private _filters = inject(AltReportNodesFilterService);
  private _executionDialogs = inject(AltExecutionDialogsService);
  protected readonly _mode = inject(VIEW_MODE);

  protected handleOpenIteration({ node, restParams }: OpenIterationsEvent): void {
    this._executionDialogs.openIterations(DrilldownRootType.TESTCASES, node, restParams);
  }

  protected openMaximized(): void {
    this._executionDialogs.openDrilldownRoot(DrilldownRootType.TESTCASES);
  }

  search(value: string): void {
    this._filters.updateStatusCtrl([]);
    this._filters.searchCtrl.setValue(value);
  }
}
