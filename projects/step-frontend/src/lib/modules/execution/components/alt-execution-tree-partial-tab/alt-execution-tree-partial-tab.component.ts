import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import {
  AggregatedReportViewRequest,
  AugmentedControllerService,
  AugmentedExecutionsService,
  TreeStateService,
} from '@exense/step-core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, filter, finalize, map, of, shareReplay, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionTabsService, STATIC_TABS } from '../../services/alt-execution-tabs.service';

@Component({
  selector: 'step-alt-execution-tree-partial-tab',
  templateUrl: './alt-execution-tree-partial-tab.component.html',
  styleUrl: './alt-execution-tree-partial-tab.component.scss',
  providers: [
    AggregatedReportViewTreeStateService,
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTreePartialTabComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _executionState = inject(AltExecutionStateService);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _controllerService = inject(AugmentedControllerService);
  private _tabsService = inject(AltExecutionTabsService);

  private reportNodeId$ = this._activatedRoute.params.pipe(
    map((params) => params['reportNodeId'] as string),
    filter((reportNodeId) => !!reportNodeId),
  );

  private reportNode$ = this.reportNodeId$.pipe(
    switchMap((nodeId) => this._controllerService.getReportNode(nodeId)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private range$ = this._executionState.dateRange$.pipe(
    map((range) => {
      if (!range) {
        return undefined;
      }
      const from = range.start?.toMillis();
      const to = range.end?.toMillis();
      return { from, to };
    }),
  );

  protected showSpinner = signal(false);

  ngOnInit(): void {
    this.setupTree();
    this.initializeTab();
  }

  private setupTree(): void {
    combineLatest([this._executionState.executionId$, this.range$, this.reportNode$])
      .pipe(
        switchMap(([executionId, range, reportNode]) => {
          this.showSpinner.set(true);
          const request: AggregatedReportViewRequest = { range, selectedReportNodeId: reportNode.id };
          return this._executionsApi.getAggregatedReportView(executionId, request).pipe(
            map((tree) => (!tree ? undefined : { tree, artefactId: reportNode.artefactID ?? undefined })),
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
        const selectedNodeIds = result.artefactId ? [result.artefactId] : [];
        this._treeState.init(result.tree, { selectedNodeIds });
      });
  }

  private initializeTab(): void {
    this.reportNode$.subscribe((reportNode) => {
      this._tabsService.addTab(
        reportNode.id!,
        `Tree: ${reportNode.name}`,
        `sub-tree/${reportNode.id!}`,
        STATIC_TABS.ANALYTICS,
      );
    });
  }
}
