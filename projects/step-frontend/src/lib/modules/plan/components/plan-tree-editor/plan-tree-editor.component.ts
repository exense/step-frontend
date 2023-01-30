import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactTreeNode,
  AugmentedScreenService,
  AuthService,
  CustomComponent,
  DynamicFieldsSchema,
  DynamicValueString,
  KeywordsService,
  Plan,
  PlanEditorService,
  PlanEditorStrategy,
  PlansService,
  TreeStateService,
} from '@exense/step-core';
import { BehaviorSubject, filter, map, merge, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PlanHistoryService } from '../../services/plan-history.service';

@Component({
  selector: 'step-plan-tree-editor',
  templateUrl: './plan-tree-editor.component.html',
  styleUrls: ['./plan-tree-editor.component.scss'],
})
export class PlanTreeEditorComponent implements CustomComponent, PlanEditorStrategy, OnInit, OnDestroy {
  context?: any;
  private terminator$ = new Subject<unknown>();
  private planChange$ = new Subject<Plan>();

  private planInternal$ = new BehaviorSubject<Plan | undefined>(undefined);

  get plan(): Plan | undefined {
    return this.planInternal$.value;
  }

  readonly plan$ = this.planInternal$.asObservable();
  readonly hasRedo$ = this._planHistory.hasRedo$;
  readonly hasUndo$ = this._planHistory.hasUndo$;

  private artefactsClipboard: AbstractArtefact[] = [];

  constructor(
    private _planEditor: PlanEditorService,
    private _planApi: PlansService,
    private _treeState: TreeStateService<AbstractArtefact, ArtefactTreeNode>,
    private _authService: AuthService,
    private _keywordCallsApi: KeywordsService,
    private _screenTemplates: AugmentedScreenService,
    private _planHistory: PlanHistoryService
  ) {}

  addControl(artefactTypeId: string): void {
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

            const value = property.default ? property.default : '';
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

  init(plan: Plan) {
    this.planInternal$.next(plan);
    const root = plan.root;
    if (root) {
      this._treeState.init(root, [root.id!]);
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
        this._treeState.init(plan.root!, undefined, false);
        this._planHistory.addToHistory(plan);
        this.planInternal$.next(plan);
      })
    );

    const planUpdatedByHistory$ = this._planHistory.planChange$.pipe(
      tap((plan) => {
        this._treeState.init(plan.root!, undefined, false);
        this.planInternal$.next(plan);
      })
    );

    merge(planUpdateByTree$, planUpdateByEditor$, planUpdatedByHistory$)
      .pipe(
        switchMap((plan) => this._planApi.savePlan(plan)),
        takeUntil(this.terminator$)
      )
      .subscribe((updatedPlan) => {
        if (this.planInternal$.value) {
          this.planInternal$.value.customFields = updatedPlan.customFields;
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
    this.artefactsClipboard = this._treeState.getSelectedNodes().map(({ originalArtefact }) => originalArtefact);
  }

  paste(node?: AbstractArtefact): void {
    if (!this.artefactsClipboard?.length) {
      return;
    }
    this._planApi.cloneArtefacts(this.artefactsClipboard).subscribe((children) => {
      this.artefactsClipboard = [];
      if (node) {
        this._treeState.selectNodeById(node.id!);
      }
      this._treeState.addChildrenToSelectedNode(...children);
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
    this.terminator$.next({});
    this.terminator$.complete();
  }
}
