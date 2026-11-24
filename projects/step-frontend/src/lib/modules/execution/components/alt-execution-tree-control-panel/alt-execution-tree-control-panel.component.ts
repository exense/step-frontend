import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  SearchFieldComponent,
  SearchPaginatorComponent,
  StepCoreModule,
  StepIconsModule,
  StepMaterialModule,
  TreeStateService,
} from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { TREE_SEARCH_DESCRIPTION } from '../../services/tree-search-description.token';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';
import { AltExecutionReportWidgetType } from '../../shared/alt-execution-report-details';

@Component({
  selector: 'step-alt-execution-tree-control-panel',
  templateUrl: './alt-execution-tree-control-panel.component.html',
  styleUrl: './alt-execution-tree-control-panel.component.scss',
  standalone: false,
})
export class AltExecutionTreeControlPanelComponent {
  private _treeState = inject(TreeStateService);
  protected readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION, { optional: true }) ?? '';
  protected readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService, { optional: true });

  readonly hideCollapseButtons = input(false);
  readonly disableCollapse = input(false);
  readonly disableExpand = input(false);
  readonly expandTooltip = input('Expand All');
  readonly widgetType = input<AltExecutionReportWidgetType>();

  protected collapseAll(): void {
    if (this.disableCollapse()) {
      return;
    }
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    if (this.disableExpand()) {
      return;
    }
    this._treeState.expandAll();
  }
}
