import { Component, inject, ViewEncapsulation } from '@angular/core';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltExecutionDialogsService, OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { AltReportNodeListProvideTestcasesDirective } from '../../directives/alt-report-node-list-provide-testcases.directive';

@Component({
  selector: 'step-alt-report-node-testcases-widget',
  templateUrl: './alt-report-node-testcases-widget.component.html',
  styleUrl: './alt-report-node-testcases-widget.component.scss',
  hostDirectives: [AltReportNodeListProvideTestcasesDirective],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeTestcasesWidgetComponent {
  private _executionDialogs = inject(AltExecutionDialogsService);
  protected readonly _mode = inject(VIEW_MODE);

  protected handleOpenIteration({ node, restParams }: OpenIterationsEvent): void {
    this._executionDialogs.openIterations(DrilldownRootType.TESTCASES, node, restParams);
  }
}
