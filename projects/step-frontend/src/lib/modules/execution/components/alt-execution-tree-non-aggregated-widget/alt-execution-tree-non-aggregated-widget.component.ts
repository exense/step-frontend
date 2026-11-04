import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { ReportNode } from '@exense/step-core';
import { AltExecutionTreeNonAggregatedWidgetDirective } from '../../directives/alt-execution-tree-non-aggregated-widget.directive';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { DrilldownRootType } from '../../shared/drilldown-root-type';

@Component({
  selector: 'step-alt-execution-tree-non-aggregated-widget',
  templateUrl: './alt-execution-tree-non-aggregated-widget.component.html',
  styleUrl: './alt-execution-tree-non-aggregated-widget.component.scss',
  hostDirectives: [AltExecutionTreeNonAggregatedWidgetDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionTreeNonAggregatedWidgetComponent {
  protected readonly _state = inject(AltExecutionStateService);
  private _executionDialogs = inject(AltExecutionDialogsService);

  protected openMaximized(): void {
    this._executionDialogs.openDrilldownRoot(DrilldownRootType.REPORT_TREE);
  }

  protected openAlternateTree(): void {
    this._executionDialogs.openDrilldownRoot(DrilldownRootType.TREE);
  }

  protected openDrillDown(node: ReportNode): void {
    this._executionDialogs.openIterations(DrilldownRootType.REPORT_TREE, {
      reportNodeId: node.id,
    });
  }
}
