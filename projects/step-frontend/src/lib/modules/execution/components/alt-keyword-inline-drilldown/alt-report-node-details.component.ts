import { Component, computed, inject, input, output } from '@angular/core';
import {
  ArtefactService,
  AugmentedControllerService,
  CLICK_STRATEGY,
  ClickStrategyType,
  ReportNode,
  TreeNodeUtilsService,
  TreeStateService,
} from '@exense/step-core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';
// step.ar
@Component({
  selector: 'step-alt-report-node-details',
  templateUrl: './alt-report-node-details.component.html',
  styleUrl: './alt-report-node-details.component.scss',
  providers: [
    AggregatedReportViewTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: AggregatedReportViewTreeNodeUtilsService,
    },
    AggregatedReportViewTreeStateService,
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
    {
      provide: CLICK_STRATEGY,
      useValue: ClickStrategyType.DOUBLE_CLICK,
    },
  ],
  standalone: false,
})
export class AltReportNodeDetailsComponent<R extends ReportNode = ReportNode> {
  private _controllerService = inject(AugmentedControllerService);
  private _artefactService = inject(ArtefactService);

  readonly node = input.required<R>();
  readonly showArtefact = input(false);
  readonly openTreeView = output();

  private children$ = toObservable(this.node).pipe(
    switchMap((node) => {
      if (node.status !== 'FAILED') {
        return of(undefined);
      }
      return this._controllerService.getReportNodeChildren(node.id!).pipe(catchError(() => of(undefined)));
    }),
    map((children: ReportNode[] | undefined) => {
      return (children ?? []).filter(
        (child) =>
          (child._class === 'step.artefacts.reports.AssertReportNode' ||
            child._class === 'step.artefacts.reports.PerformanceAssertReportNode') &&
          child.status !== 'PASSED',
      );
    }),
  );

  protected readonly children = toSignal(this.children$, { initialValue: [] });
  protected readonly artefactClass = computed(() => this.node().resolvedArtefact?._class);

  protected readonly detailsComponent = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    return meta?.reportDetailsComponent;
  });
}
