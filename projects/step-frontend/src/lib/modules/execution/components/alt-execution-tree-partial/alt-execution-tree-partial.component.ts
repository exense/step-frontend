import { Component, DestroyRef, inject, input, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { AggregatedReportViewRequest, AugmentedExecutionsService, ReportNode } from '@exense/step-core';
import { catchError, combineLatest, finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';

@Component({
  selector: 'step-alt-execution-tree-partial',
  templateUrl: './alt-execution-tree-partial.component.html',
  styleUrl: './alt-execution-tree-partial.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreePartialComponent implements OnInit {
  private _executionState = inject(AltExecutionStateService);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  readonly node = input.required<ReportNode>();
  readonly allowDialogOpen = input(true);

  protected showSpinner = signal(false);

  private reportNode$ = toObservable(this.node);

  ngOnInit(): void {
    this.setupTree();
  }

  private setupTree(): void {
    combineLatest([this._executionState.executionId$, this._executionState.timeRange$, this.reportNode$])
      .pipe(
        switchMap(([executionId, range, reportNode]) => {
          this.showSpinner.set(true);
          const request: AggregatedReportViewRequest = { range, selectedReportNodeId: reportNode.id };
          return this._executionsApi.getAggregatedReportView(executionId, request).pipe(
            map((response) => {
              if (!response?.aggregatedReportView) {
                return undefined;
              }
              const artefactId = reportNode.artefactID;
              return {
                ...response,
                artefactId,
              };
            }),
            catchError(() => of(undefined)),
            finalize(() => this.showSpinner.set(false)),
          );
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        const { aggregatedReportView, resolvedPartialPath, artefactId } = result;
        const selectedNodeIds = artefactId ? [artefactId] : [];
        this._treeState.init(aggregatedReportView!, { selectedNodeIds, resolvedPartialPath });
        if (artefactId) {
          this.tree()?.focusNode?.(artefactId);
        }
      });
  }
}
