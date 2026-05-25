import { Component, computed, inject, input, output, untracked, viewChild } from '@angular/core';
import {
  ArtefactService,
  AugmentedControllerService,
  CLICK_STRATEGY,
  ClickStrategyType,
  ReportNode,
} from '@exense/step-core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { KeyValue } from '@angular/common';
import { AltExecutionTreePartialComponent } from '../alt-execution-tree-partial/alt-execution-tree-partial.component';
import { AltReportNodeDetailsDirective } from '../../directives/alt-report-node-details.directive';
import { OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { DrilldownPartialTreeStateDirective } from '../../directives/drilldown-partial-tree-state.directive';

@Component({
  selector: 'step-alt-report-node-details',
  templateUrl: './alt-report-node-details.component.html',
  styleUrl: './alt-report-node-details.component.scss',
  providers: [
    {
      provide: CLICK_STRATEGY,
      useValue: ClickStrategyType.DOUBLE_CLICK,
    },
  ],
  standalone: false,
  hostDirectives: [
    {
      directive: AltReportNodeDetailsDirective,
      inputs: ['node'],
    },
    DrilldownPartialTreeStateDirective,
  ],
})
export class AltReportNodeDetailsComponent {
  private _controllerService = inject(AugmentedControllerService);
  private _artefactService = inject(ArtefactService);
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _nodeDetailsDirective = inject(AltReportNodeDetailsDirective);

  readonly showArtefact = input(false);

  private readonly partialTree = viewChild('partialTree', { read: AltExecutionTreePartialComponent });

  protected readonly reportNode = computed(() => {
    const reportNode = this._nodeDetailsDirective.reportNode();
    return reportNode as ReportNode;
  });

  readonly openIterations = output<OpenIterationsEvent>();
  readonly openDetails = output<ReportNode>();
  readonly openPartialTree = output<ReportNode>();

  private children$ = toObservable(this.reportNode).pipe(
    switchMap((node) => {
      if (node.status !== 'FAILED') {
        return of(undefined);
      }
      const artefactClass = node.resolvedArtefact?._class;
      const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
      if (meta?.reportDetailsComponent) {
        return of(undefined);
      }
      return this._controllerService.getReportNodesWithErrors(node.id!).pipe(catchError(() => of(undefined)));
    }),
    map((children: ReportNode[] | undefined) => children ?? []),
  );

  protected searchFor($event: string): void {
    const tree = untracked(() => this.partialTree());
    tree?.focusAndSearch?.($event);
  }

  private readonly aggregatedNode = computed(() => {
    const reportNode = this.reportNode();
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
  protected readonly artefactClass = computed(() => this.reportNode().resolvedArtefact?._class);

  /**
   * todo: As tree has been moved to a separate component, rootCauseErrors will never work
   * Later the new REST endpoint should appear, to retrieve it
   * **/
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

  protected readonly isTestCase = computed(() => {
    const artefactClass = this.artefactClass();
    return artefactClass === 'TestCase';
  });

  protected readonly hideFirstPanel = computed(() => {
    const isTestCase = this.isTestCase();
    const rootCauseErrors = this.rootCauseErrors();
    return isTestCase && !rootCauseErrors?.length;
  });

  protected readonly detailsComponent = computed(() => {
    const artefactClass = this.artefactClass();
    const meta = artefactClass ? this._artefactService.getArtefactType(artefactClass) : undefined;
    return meta?.reportDetailsComponent;
  });

  protected readonly artefactHashContainer = computed(() => {
    const reportNode = this.reportNode();
    const aggregatedNode = this.aggregatedNode();
    const artefactHash = (aggregatedNode?.artefactHash || reportNode.artefactHash)!;
    return { artefactHash };
  });
}
