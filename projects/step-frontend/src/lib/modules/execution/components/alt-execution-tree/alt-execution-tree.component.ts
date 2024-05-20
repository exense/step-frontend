import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';

@Component({
  selector: 'step-alt-execution-tree',
  templateUrl: './alt-execution-tree.component.html',
  styleUrl: './alt-execution-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreeComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  readonly artefact = computed(() => this._treeState.selectedNode()?.originalArtefact);
}
