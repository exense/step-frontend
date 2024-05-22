import { Component, computed, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-alt-execution-tree',
  templateUrl: './alt-execution-tree.component.html',
  styleUrl: './alt-execution-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreeComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);

  private _treeState = inject(AggregatedReportViewTreeStateService);
  readonly artefact = computed(() => this._treeState.selectedNode()?.originalArtefact);

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .pipe(
        map((params) => params['artefactId']),
        filter((artefactId) => !!artefactId),
        takeUntilDestroyed(this._destroyRef),
        map((artefactId) => `details_data_${artefactId}`),
        switchMap((nodeId) => this._treeState.expandNode(nodeId)),
      )
      .subscribe();
  }
}
