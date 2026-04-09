import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  SearchFieldComponent,
  SearchPaginatorComponent,
  StepCoreModule,
  StepIconsModule,
  StepMaterialModule,
} from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { TREE_SEARCH_DESCRIPTION } from '../../services/tree-search-description.token';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';

@Component({
  selector: 'step-alt-execution-tree-control-panel',
  templateUrl: './alt-execution-tree-control-panel.component.html',
  styleUrl: './alt-execution-tree-control-panel.component.scss',
  standalone: false,
})
export class AltExecutionTreeControlPanelComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION);
  protected readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);

  protected collapseAll(): void {
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    this._treeState.expandAll();
  }
}
