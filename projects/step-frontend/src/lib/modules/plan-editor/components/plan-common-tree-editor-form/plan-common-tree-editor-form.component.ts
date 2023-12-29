import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactsFactoryService,
  ArtefactTreeNode,
  breadthFirstSearch,
  COPIED_ARTEFACTS,
  CustomComponent,
  DialogsService,
  KeywordsService,
  PersistenceService,
  Plan,
  PlanEditorService,
  PlanEditorStrategy,
  PlansService,
  TreeStateService,
  PlanEditorApiService,
} from '@exense/step-core';
import { BehaviorSubject, filter, first, map, merge, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PlanHistoryService } from '../../injectables/plan-history.service';

const MESSAGE_ADD_AT_MULTIPLE_NODES =
  'Adding elements is not supported when more then one node is selected in the tree';

@Component({
  selector: 'step-plan-common-tree-editor-form',
  templateUrl: './plan-common-tree-editor-form.component.html',
  styleUrls: ['./plan-common-tree-editor-form.component.scss'],
})
export class PlanCommonTreeEditorFormComponent implements CustomComponent, PlanEditorStrategy, OnInit, OnDestroy {
  private _planEditor = inject(PlanEditorService);
  private _planEditorApi = inject(PlanEditorApiService);
  private _planApi = inject(PlansService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planHistory = inject(PlanHistoryService);
  private _dialogs = inject(DialogsService);
  private _persistenceService = inject(PersistenceService);
  private _artefactsFactory = inject(ArtefactsFactoryService);

  context?: any;
  private terminator$ = new Subject<void>();
  private planChange$ = new Subject<Plan>();

  private planInternal$ = new BehaviorSubject<Plan | undefined>(undefined);

  get plan(): Plan | undefined {
    return this.planInternal$.value;
  }

  readonly plan$ = this.planInternal$.asObservable();
  readonly hasRedo$ = this._planHistory.hasRedo$;
  readonly hasUndo$ = this._planHistory.hasUndo$;

  ngOnInit(): void {
    this.initPlanUpdate();
    this._planEditor.useStrategy(this);
  }

  ngOnDestroy(): void {
    this.planChange$.complete();
    this.planInternal$.complete();
    this._planEditor.removeStrategy();
    this.terminator$.next();
    this.terminator$.complete();
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

  addFunction(keywordId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES).subscribe();
      return;
    }
    this._artefactsFactory.createCallKeywordArtefact(keywordId).subscribe((artefact) => {
      this._treeState.addChildrenToSelectedNode(artefact);
    });
  }

  addPlan(planId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES).subscribe();
      return;
    }
    this._artefactsFactory.createCallPlanArtefact(planId).subscribe((artefact) => {
      this._treeState.addChildrenToSelectedNode(artefact);
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

  init(plan: Plan, selectedArtefactId?: string): void {
    this.planInternal$.next(plan);
    const root = plan.root;
    if (root) {
      const selectedId = selectedArtefactId || root.id!;
      this._treeState.init(root, { selectedNodeIds: [selectedId] });
    }
    this._planHistory.init(plan);
  }

  handlePlanChange(): void {
    this.planChange$.next(this.plan!);
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
    this._persistenceService.setItem(COPIED_ARTEFACTS, JSON.stringify(artefacts));
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

    const artefacts = nodes.map((node) => node.originalArtefact);
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

  toggleSkip(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.toggleSkip();
  }

  private initPlanUpdate(): void {
    const planUpdateByTree$ = this._treeState.treeUpdate$.pipe(
      map(() => this.plan),
      filter((plan) => !!plan),
      tap((plan) => this._planHistory.addToHistory(plan!))
    );

    const planUpdateByEditor$ = this.planChange$.pipe(
      tap((plan) => {
        this._treeState.init(plan.root!, { expandAllByDefault: false });
        this._planHistory.addToHistory(plan);
        this.planInternal$.next(plan);
      })
    );

    const planUpdatedByHistory$ = this._planHistory.planChange$.pipe(
      tap((plan) => {
        this._treeState.init(plan.root!, { expandAllByDefault: false });
        this.planInternal$.next(plan);
      })
    );

    merge(planUpdateByTree$, planUpdateByEditor$, planUpdatedByHistory$)
      .pipe(
        switchMap((plan) => this._planEditorApi.savePlan(plan!)),
        takeUntil(this.terminator$)
      )
      .subscribe(({ plan, forceRefresh }) => {
        if (forceRefresh) {
          this._treeState.selectedNode$.pipe(first()).subscribe((node) => this.init(plan, node?.id));
        }
        if (this.planInternal$.value) {
          this.planInternal$.value.customFields = plan.customFields;
        }
      });
  }

  private cloneArtefactsFromBuffer(): Observable<AbstractArtefact[] | undefined> {
    const copiedArtefactsJSON = this._persistenceService.getItem(COPIED_ARTEFACTS);

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
