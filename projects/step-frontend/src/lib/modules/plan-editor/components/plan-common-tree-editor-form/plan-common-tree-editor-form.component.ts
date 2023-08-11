import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactTreeNode,
  AugmentedScreenService,
  AuthService,
  breadthFirstSearch,
  COPIED_ARTEFACTS,
  CustomComponent,
  DialogsService,
  DynamicFieldsSchema,
  DynamicValueString,
  KeywordsService,
  PersistenceService,
  Plan,
  PlanEditorService,
  PlanEditorStrategy,
  PlansService,
  TreeStateService,
} from '@exense/step-core';
import { BehaviorSubject, filter, first, map, merge, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PlanHistoryService } from '../../injectables/plan-history.service';
import { ArtefactTreeNodeUtilsService } from '../../injectables/artefact-tree-node-utils.service';
import { PlanEditorApiService } from '../../injectables/plan-editor-api.service';

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
  private _authService = inject(AuthService);
  private _keywordCallsApi = inject(KeywordsService);
  private _screenTemplates = inject(AugmentedScreenService);
  private _planHistory = inject(PlanHistoryService);
  private _dialogs = inject(DialogsService);
  private _persistenceService = inject(PersistenceService);
  private _artefactTreeNodeUtilsService = inject(ArtefactTreeNodeUtilsService);

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

  addControl(artefactTypeId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES);
      return;
    }
    this._planApi
      .getArtefactType(artefactTypeId)
      .pipe(
        map((artefact) => {
          artefact!.dynamicName!.dynamic = artefact!.useDynamicName;
          return artefact;
        })
      )
      .subscribe((artefact) => {
        this._treeState.addChildrenToSelectedNode(artefact);
      });
  }

  addFunction(keywordId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES);
      return;
    }
    this._keywordCallsApi
      .getFunctionById(keywordId)
      .pipe(
        switchMap((keyword) => {
          const artefact$ = this._planApi.getArtefactType('CallKeyword');
          return artefact$.pipe(
            map((artefact) => {
              artefact!.attributes!['name'] = keyword!.attributes!['name'];
              artefact!.dynamicName!.dynamic = artefact.useDynamicName;
              return { artefact, keyword };
            })
          );
        }),
        switchMap(({ artefact, keyword }) => {
          const inputs$ = this._screenTemplates.getInputsForScreenPost('functionTable');
          return inputs$.pipe(
            map((inputs) => {
              const functionAttributes = inputs.reduce((res, input) => {
                const attributeId = (input?.id || '').replace('attributes.', '');
                if (!attributeId || !keyword?.attributes?.[attributeId]) {
                  return res;
                }
                const dynamic = false;
                const value = keyword.attributes[attributeId];
                res[attributeId] = { value, dynamic };
                return res;
              }, {} as Record<string, { value: string; dynamic: boolean }>);

              (artefact as any)['function'] = { value: JSON.stringify(functionAttributes), dynamic: false };
              return { artefact, keyword };
            })
          );
        }),
        map(({ artefact, keyword }) => {
          if (this._authService.getConf()?.miscParams?.['enforceschemas'] !== 'true') {
            return artefact;
          }

          const schema = keyword?.schema as unknown as DynamicFieldsSchema | undefined;
          if (!schema?.properties) {
            return artefact;
          }

          const targetObject = (schema?.required || []).reduce((res, field) => {
            const property = schema?.properties[field];
            if (!property) {
              return res;
            }

            const value = property.default;
            res[field] = { value, dynamic: false };
            return res;
          }, {} as Record<string, DynamicValueString>);

          (artefact as any)['argument'] = {
            dynamic: false,
            value: JSON.stringify(targetObject),
            expression: null,
            expressionType: null,
          };

          return artefact;
        })
      )
      .subscribe((artefact) => {
        this._treeState.addChildrenToSelectedNode(artefact);
      });
  }

  addPlan(planId: string): void {
    if (this._treeState.isMultipleNodesSelected()) {
      this._dialogs.showErrorMsg(MESSAGE_ADD_AT_MULTIPLE_NODES);
      return;
    }
    this._planApi
      .getPlanById(planId)
      .pipe(
        switchMap((plan) => {
          const artefact$ = this._planApi.getArtefactType('CallPlan');
          return artefact$.pipe(
            map((artefact) => {
              artefact.attributes!['name'] = plan.attributes!['name'];
              (artefact as any)['planId'] = planId;
              artefact.dynamicName!.dynamic = artefact.useDynamicName;
              return artefact;
            })
          );
        })
      )
      .subscribe((artefact) => {
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

  handlePlanChange(): void {
    this.planChange$.next(this.plan!);
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

    const artefacts: AbstractArtefact[] = [];
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
        artefacts.push(node.originalArtefact);
      }
    });

    this._persistenceService.setItem(COPIED_ARTEFACTS, JSON.stringify(artefacts));
  }

  paste(node?: AbstractArtefact): void {
    const copiedArtefactsJSON = this._persistenceService.getItem(COPIED_ARTEFACTS);

    if (!copiedArtefactsJSON) {
      return;
    }

    const artefacts = JSON.parse(copiedArtefactsJSON);

    if (!artefacts?.length) {
      return;
    }

    this._planApi.cloneArtefacts(artefacts).subscribe((children) => {
      if (node) {
        this._treeState.selectNodeById(node.id!);
      }

      this._treeState.addChildrenToSelectedNode(...children);

      const flatChildren = breadthFirstSearch({
        items: children,
        children: (item) => item.children || [],
      });
      const flatChildrenIds = flatChildren.map((child) => child.id!);

      this._treeState.expandNodes(flatChildrenIds);
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
}
