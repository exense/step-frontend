import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactsFactoryService,
  ArtefactTreeNode,
  breadthFirstSearch,
  COPIED_ARTEFACTS,
  CustomComponent,
  DialogsService,
  PlanEditorService,
  PlanEditorStrategy,
  PlansService,
  TreeStateService,
  PlanContextApiService,
  PlanContext,
} from '@exense/step-core';
import { BehaviorSubject, filter, first, forkJoin, map, merge, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { PlanHistoryService } from '../../injectables/plan-history.service';
import { CopyBufferService } from '../../injectables/copy-buffer.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const MESSAGE_ADD_AT_MULTIPLE_NODES =
  'Adding elements is not supported when more then one node is selected in the tree';

@Component({
  selector: 'step-plan-common-tree-editor-form',
  templateUrl: './plan-common-tree-editor-form.component.html',
  styleUrl: './plan-common-tree-editor-form.component.scss',
})
export class PlanCommonTreeEditorFormComponent implements CustomComponent, PlanEditorStrategy, OnInit, OnDestroy {
  private _planEditor = inject(PlanEditorService);
  private _planEditorApi = inject(PlanContextApiService);
  private _planApi = inject(PlansService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planHistory = inject(PlanHistoryService);
  private _dialogs = inject(DialogsService);
  private _copyBuffer = inject(CopyBufferService);
  private _artefactsFactory = inject(ArtefactsFactoryService);
  private _destroyRef = inject(DestroyRef);

  context?: any;
  private planChange$ = new Subject<PlanContext>();

  private selectedNode$ = toObservable(this._treeState.selectedNode);
  private planContextInternal$ = new BehaviorSubject<PlanContext | undefined>(undefined);

  get planContext(): PlanContext | undefined {
    return this.planContextInternal$.value;
  }

  readonly planContext$ = this.planContextInternal$.asObservable();

  readonly hasRedo$ = this._planHistory.hasRedo$;
  readonly hasUndo$ = this._planHistory.hasUndo$;

  ngOnInit(): void {
    this.initPlanUpdate();
    this._planEditor.useStrategy(this);
  }

  ngOnDestroy(): void {
    this.planChange$.complete();
    this.planContextInternal$.complete();
    this._planEditor.removeStrategy();
  }

  addControl(artefactTypeId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES).subscribe();
      return;
    }
    this._artefactsFactory.createControlArtefact(artefactTypeId).subscribe((artefact) => {
      this._treeState.addChildrenToSelectedNode(artefact);
    });
  }

  addKeywords(keywordIds: string[]): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES).subscribe();
      return;
    }
    const artefactsCreation = keywordIds.map((id) => this._artefactsFactory.createCallKeywordArtefact(id));
    forkJoin(artefactsCreation).subscribe((artefacts) => {
      this._treeState.addChildrenToSelectedNode(...artefacts);
    });
  }

  addPlans(planIds: string[]): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES).subscribe();
      return;
    }
    const artefactsCreation = planIds.map((id) => this._artefactsFactory.createCallPlanArtefact(id));
    forkJoin(artefactsCreation).subscribe((artefacts) => {
      this._treeState.addChildrenToSelectedNode(...artefacts);
    });
  }

  undo(): void {
    this._planHistory.undo();
  }

  redo(): void {
    this._planHistory.redo();
  }

  discardAll(): void {
    this._planHistory.discardAll();
  }

  init(context: PlanContext, selectedArtefactId?: string): void {
    this.planContextInternal$.next(context);
    const root = context!.plan!.root;
    if (root) {
      const selectedId = selectedArtefactId || root.id!;
      this._treeState.init(root, { selectedNodeIds: [selectedId] });
    }
    this._planHistory.init(context);
  }

  handlePlanChange(): void {
    this.planChange$.next(this.planContext!);
  }

  moveOut(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.moveSelectedNodesOut();
  }

  moveUp(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.moveSelectedNodes('up');
  }

  moveDown(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.moveSelectedNodes('down');
  }

  moveInNextSibling(node?: AbstractArtefact) {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.moveSelectedNodesIn('nextSibling');
  }

  moveInPrevSibling(node?: AbstractArtefact) {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.moveSelectedNodesIn('prevSibling');
  }

  delete(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.removeSelectedNodes();
  }

  copy(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }

    const artefacts = this.getNodesForCopy().map((node) => node.originalArtefact);
    this._copyBuffer.setItem(COPIED_ARTEFACTS, JSON.stringify(artefacts));
  }

  paste(node?: AbstractArtefact): void {
    this.cloneArtefactsFromBuffer().subscribe((children) => {
      if (!children) {
        return;
      }
      if (node) {
        this._treeState.selectNodeById(node.id!);
      }

      this._treeState.addChildrenToSelectedNode(...children);
      this.expandChildren(children);
    });
  }

  pasteAfter(node?: AbstractArtefact): void {
    const selectedNode = node ? this._treeState.findNodeById(node.id) : this._treeState.getSelectedNodes()[0];

    if (!selectedNode) {
      return;
    }

    const parent = selectedNode?.parentId ? this._treeState.findNodeById(selectedNode.parentId) : undefined;
    if (!parent) {
      return;
    }

    const startIndex = parent.children!.indexOf(selectedNode) + 1;

    this.cloneArtefactsFromBuffer().subscribe((children) => {
      if (!children) {
        return;
      }
      this._treeState.insertChildren(parent.id, children, startIndex);
      this.expandChildren(children);
    });
  }

  duplicate(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }

    const nodes = this.getNodesForCopy();
    if (!nodes.length) {
      return;
    }

    const parent = this._treeState.findNodeById(nodes[0].parentId);
    if (!parent) {
      return;
    }
    const indexes = nodes.map((node) => parent.children!.indexOf(node));
    const insertIndex = Math.max(...indexes) + 1;

    const artefacts = nodes.map((node) => node.originalArtefact).filter((artefact) => !!artefact) as AbstractArtefact[];
    this._planApi.cloneArtefacts(artefacts).subscribe((children) => {
      this._treeState.insertChildren(parent.id, children, insertIndex);
      this.expandChildren(children);
    });
  }

  rename(node?: AbstractArtefact) {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.editSelectedNode();
  }

  toggleSkip(node?: AbstractArtefact, forceSkip?: boolean): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.toggleSkip(forceSkip);
  }

  private initPlanUpdate(): void {
    const planUpdateByTree$ = this._treeState.treeUpdate$.pipe(
      map(() => this.planContext),
      filter((context) => !!context),
      tap((context) => this._planHistory.addToHistory(context!)),
    );

    const planUpdateByEditor$ = this.planChange$.pipe(
      tap((context) => {
        this._treeState.init(context!.plan!.root!, { expandAllByDefault: false });
        this._planHistory.addToHistory(context);
        this.planContextInternal$.next(context);
      }),
    );

    const planUpdatedByHistory$ = this._planHistory.planContextChange$.pipe(
      tap((context) => {
        this._treeState.init(context!.plan!.root!, { expandAllByDefault: false });
        const selectedNodeId = this._treeState.selectedNodeIds()?.[0];
        if (selectedNodeId && !this._treeState.findNodeById(selectedNodeId)) {
          this._treeState.selectNode(context!.plan.root!.id!);
        }
        this.planContextInternal$.next(context);
      }),
    );

    merge(planUpdateByTree$, planUpdateByEditor$, planUpdatedByHistory$)
      .pipe(
        switchMap((context) => this._planEditorApi.savePlan(context!)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((savedContext) => {
        const forceRefresh = savedContext.forceRefresh;
        if (forceRefresh) {
          this.selectedNode$.pipe(first()).subscribe((node) => this.init(savedContext, node?.id));
        } else if (this.planContext) {
          this.planContext.entity.customFields = savedContext.entity.customFields;
        }
      });
  }

  private cloneArtefactsFromBuffer(): Observable<AbstractArtefact[] | undefined> {
    const copiedArtefactsJSON = this._copyBuffer.getItem(COPIED_ARTEFACTS);

    if (!copiedArtefactsJSON) {
      return of(undefined);
    }

    const artefacts = JSON.parse(copiedArtefactsJSON);

    if (!artefacts?.length) {
      return of(undefined);
    }

    return this._planApi.cloneArtefacts(artefacts);
  }

  private expandChildren(children: AbstractArtefact[]): void {
    const flatChildren = breadthFirstSearch({
      items: children,
      children: (item) => item.children || [],
    });
    const flatChildrenIds = flatChildren.map((child) => child.id!);

    this._treeState.expandNodes(flatChildrenIds);
  }

  private getNodesForCopy(): ArtefactTreeNode[] {
    const result: ArtefactTreeNode[] = [];
    const selectedNodes = this._treeState.getSelectedNodes();
    const visitedNodesIds = new Set<string>();

    selectedNodes.forEach((node) => {
      const flatChildren = breadthFirstSearch({
        items: node.children || [],
        children: (item) => item.children || [],
        predicate: (item) => !visitedNodesIds.has(item.id),
      });

      flatChildren.forEach((node) => visitedNodesIds.add(node.id));

      if (!visitedNodesIds.has(node.id)) {
        result.push(node);
      }
    });

    return result;
  }
}
