import { Component, inject, viewChild } from '@angular/core';
import { ElementSizeDirective, ReportNode } from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';
import { AltExecutionTreeWidgetDirective } from '../../directives/alt-execution-tree-widget.directive';
import { AltExecutionDialogsService, OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { DrilldownRootType } from '../../shared/drilldown-root-type';

@Component({
  selector: 'step-alt-execution-tree-widget',
  templateUrl: './alt-execution-tree-widget.component.html',
  styleUrl: './alt-execution-tree-widget.component.scss',
  hostDirectives: [ElementSizeDirective, AltExecutionTreeWidgetDirective],
  standalone: false,
})
export class AltExecutionTreeWidgetComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);
  private _executionDialogs = inject(AltExecutionDialogsService);

  private readonly tree = viewChild('tree', { read: AltExecutionTreeComponent });

  handleOpenIterations(event: OpenIterationsEvent): void {
    this._executionDialogs.openIterations(event.node, {
      ...event.restParams,
      drilldownRootType: DrilldownRootType.TREE,
    });
  }

  focusAndSearch(query: string): void {
    this._treeSearch.searchCtrl.setValue(query ?? '');
  }

  focusNodeById(nodeId: string): void {
    this.tree()?.focusNode(nodeId);
  }

  focusNodeByReport(report: ReportNode): void {
    const node = this._treeState
      .findNodesByArtefactId(report.artefactID)
      .find((item) => item.artefactHash === report.artefactHash);
    if (!node?.id) {
      return;
    }
    this.focusNodeById(node.id);
  }

  focusNodeByArtefactId(artefactId: string): void {
    const nodeId = this._treeState.getNodeIdsByArtefactId(artefactId)[0];
    if (!nodeId) {
      return;
    }
    this.focusNodeById(nodeId);
  }
}
