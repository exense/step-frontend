import { Component, computed, inject, input, output, viewChild } from '@angular/core';
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
import { KeyValue } from '@angular/common';
import { AltExecutionTreePartialComponent } from '../alt-execution-tree-partial/alt-execution-tree-partial.component';

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
  private _treeState = inject(AggregatedReportViewTreeStateService);

  readonly node = input.required<R>();
  readonly showArtefact = input(false);
  readonly openTreeView = output();

  private partialTree = viewChild('partialTree', { read: AltExecutionTreePartialComponent });

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

  searchFor($event: string) {
    if (!this.partialTree()) {
      return;
    }

    this.partialTree()!.focusAndSearch($event);
  }

  private aggregatedNode = computed(() => {
    const reportNode = this.node();
    const isTreeInitialized = this._treeState.isInitialized();
    if (!isTreeInitialized) {
      return undefined;
    }
    const treeNodes = this._treeState.findNodesByArtefactId(reportNode.artefactID);
    const treeNode =
      treeNodes.length === 1 ? treeNodes[0] : treeNodes.find((node) => node.artefactHash === reportNode.artefactHash);
    return treeNode;
  });

  protected readonly children = toSignal(this.children$, { initialValue: [] });
  protected readonly artefactClass = computed(() => this.node().resolvedArtefact?._class);

  protected readonly rootCauseErrors = computed(() => {
    const treeNode = this.aggregatedNode();
    const artefactClass = this.artefactClass();
    if (!treeNode || (artefactClass !== 'TestCase' && artefactClass !== 'TestSet')) {
      return undefined;
    }

    const result: KeyValue<string, number>[] = [];

    if (treeNode.countByErrorMessage) {
      const items = Object.entries(treeNode.countByErrorMessage).map(([key, value]) => ({ key, value }));
      result.push(...items);
    }

    if (treeNode.countByChildrenErrorMessage) {
      const items = Object.entries(treeNode.countByChildrenErrorMessage).map(([key, value]) => ({ key, value }));
      result.push(...items);
    }

    return !result.length ? undefined : result;
  });

  protected readonly detailsComponent = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    return meta?.reportDetailsComponent;
  });

  protected readonly artefactHashContainer = computed(() => {
    const reportNode = this.node();
    const aggregatedNode = this.aggregatedNode();
    const artefactHash = (aggregatedNode?.artefactHash || reportNode.artefactHash)!;
    return { artefactHash };
  });
}
