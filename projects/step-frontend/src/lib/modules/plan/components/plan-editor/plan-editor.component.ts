import {
  Component,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractArtefact,
  AJS_LOCATION,
  AJS_MODULE,
  AuthService,
  DialogsService,
  KeywordsService,
  Mutable,
  Plan,
  PlansService,
  RepositoryObjectReference,
  ScreensService,
  TreeStateService,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PlanHistoryService } from '../../services/plan-history.service';
import { filter, map, merge, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PlanHandleService } from '../../services/plan-handle.service';
import { ExportDialogsService } from '../../../_common/services/export-dialogs.service';
import { ILocationService } from 'angular';
import { InteractiveSessionService } from '../../services/interactive-session.service';

type FieldAccessor = Mutable<Pick<PlanEditorComponent, 'repositoryObjectRef' | 'componentTabs'>>;

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    TreeStateService,
    PlanHistoryService,
    InteractiveSessionService,
    {
      provide: PlanHandleService,
      useExisting: forwardRef(() => PlanEditorComponent),
    },
  ],
})
export class PlanEditorComponent implements OnInit, OnChanges, OnDestroy, PlanHandleService {
  private terminator$ = new Subject<unknown>();
  private planChange$ = new Subject<Plan>();
  private artefactsClipboard: AbstractArtefact[] = [];

  @Input() planId?: string;
  plan?: Plan;

  readonly componentTabs = [
    { id: 'controls', label: 'Controls' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'other', label: 'Other Plans' },
  ];

  selectedTab = 'controls';

  readonly hasUndo$ = this._planHistory.hasUndo$;
  readonly hasRedo$ = this._planHistory.hasRedo$;

  readonly selectedArtefact$ = this._treeState.selectedArtefact$;

  readonly isInteractiveSessionActive$ = this._interactiveSession.isActive$;

  readonly repositoryObjectRef?: RepositoryObjectReference;

  constructor(
    private _treeState: TreeStateService,
    private _planHistory: PlanHistoryService,
    public _interactiveSession: InteractiveSessionService,
    private _planApi: PlansService,
    private _keywordCallsApi: KeywordsService,
    private _screenTemplates: ScreensService,
    private _authService: AuthService,
    private _exportDialogs: ExportDialogsService,
    private _dialogsService: DialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  ngOnInit(): void {
    this._interactiveSession.init();
    this.initPlanUpdate();
    this.initConsoleTabToggle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cPlanId = changes['planId'];
    if (cPlanId?.previousValue === cPlanId?.currentValue || cPlanId?.firstChange) {
      const planId = cPlanId?.currentValue;
      this.loadPlan(planId);
      (this as FieldAccessor).repositoryObjectRef = !planId
        ? undefined
        : {
            repositoryID: 'local',
            repositoryParameters: {
              ['planid']: planId,
            },
          };
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
    this.planChange$.complete();
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

  undo(): void {
    this._planHistory.undo();
  }

  redo(): void {
    this._planHistory.redo();
  }

  discardAll(): void {
    this._planHistory.discardAll();
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
    this.artefactsClipboard = this._treeState.getSelectedArtefacts();
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

  toggleSkip(node?: AbstractArtefact) {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }
    this._treeState.toggleSkip();
  }

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
          const inputs$ = this._screenTemplates.getScreenInputsByScreenId('functionTable');
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

          if (!keyword?.schema?.['properties']) {
            return artefact;
          }

          const targetObject = Object.entries(keyword.schema['properties']).reduce((res, [key, value]) => {
            const type = (value as any).type;
            const isDynamic = type === 'number' || type === 'integer' || type === 'boolean';
            const defaultValue = (value as any).default;

            if (defaultValue !== undefined) {
              console.log('default:', defaultValue);
              if (isDynamic) {
                res[key] = { expression: defaultValue, dynamic: true };
              } else {
                res[key] = { value: defaultValue, dynamic: false };
              }
            } else if (type) {
              if (isDynamic) {
                res[key] = { expression: `<${type}>`, dynamic: true };
              } else {
                res[key] = { value: `<${type}>`, dynamic: false };
              }
            }
            return res;
          }, {} as Record<string, { expression?: string; value?: string; dynamic: boolean }>);

          ((keyword?.schema?.['required'] || []) as string[]).forEach((prop) => {
            if (targetObject?.[prop]?.value) {
              targetObject[prop].value += ' (REQ)';
            }
            if (targetObject?.[prop]?.expression) {
              targetObject[prop].expression += ' (REQ)';
            }
          });

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

  exportPlan(): void {
    if (!this.planId) {
      return;
    }
    this._exportDialogs
      .displayExportDialog('Plans export', `plans/${this.planId}`, `${this.plan!.attributes!['name']}.sta`)
      .subscribe();
  }

  clonePlan(): void {
    if (!this.planId) {
      return;
    }
    const name = this.plan!.attributes!['name'];
    this._dialogsService.enterValue('Clone plan as', `${name}_Copy`, 'md', 'enterValueDialog', (value: string) => {
      this._planApi
        .clonePlan(this.planId!)
        .pipe(
          map((plan) => {
            plan!.attributes!['name'] = value;
            return plan;
          }),
          switchMap((plan) => this._planApi.savePlan(plan)),
          map((plan) => plan.id)
        )
        .subscribe((planId) => {
          this._location.path(`/root/plans/editor/${planId}`);
        });
    });
  }

  startInteractive(): void {
    this._interactiveSession.startInteractive(this.repositoryObjectRef!).subscribe();
  }

  stopInteractive(): void {
    this._interactiveSession.stopInteractive().subscribe(() => (this.selectedTab = 'controls'));
  }

  resetInteractive(): void {
    this._interactiveSession.resetInteractive().subscribe(() => (this.selectedTab = 'controls'));
  }

  execute(): void {
    const artefactIds = this._treeState.getSelectedArtefacts().map((artefact) => artefact.id!);

    this._interactiveSession.execute(this.planId!, artefactIds).subscribe();
  }

  private loadPlan(planId: string): void {
    if (!planId) {
      return;
    }
    this._planApi.getPlanById(planId).subscribe((plan) => {
      this.plan = plan;
      const root = plan.root;
      if (root) {
        this._treeState.init(root, [root.id!]);
      }
      this._planHistory.init(plan);
    });
  }

  private initPlanUpdate(): void {
    const planUpdateByTree$ = this._treeState.treeUpdate$.pipe(
      map(() => this.plan),
      filter((plan) => !!plan),
      tap((plan) => this._planHistory.addToHistory(plan!))
    );

    const planUpdateByEditor$ = this.planChange$.pipe(
      tap((plan) => {
        this._treeState.init(plan.root!);
        this._planHistory.addToHistory(plan);
        this.plan = plan;
      })
    );

    const planUpdatedByHistory$ = this._planHistory.planChange$.pipe(
      tap((plan) => {
        this._treeState.init(plan.root!);
        this.plan = plan;
      })
    );

    merge(planUpdateByTree$, planUpdateByEditor$, planUpdatedByHistory$)
      .pipe(
        switchMap((plan) => this._planApi.savePlan(plan)),
        takeUntil(this.terminator$)
      )
      .subscribe();
  }

  private initConsoleTabToggle(): void {
    this._interactiveSession.isActive$
      .pipe(
        filter((shouldConsoleExists) => {
          const hasConsole = this.componentTabs.some((tab) => tab.id === 'console');
          return hasConsole !== shouldConsoleExists;
        }),
        map((shouldConsoleExists) => {
          return shouldConsoleExists
            ? [...this.componentTabs, { id: 'console', label: 'Console' }]
            : this.componentTabs.filter((tab) => tab.id !== 'console');
        }),
        takeUntil(this.terminator$)
      )
      .subscribe((tabs) => {
        (this as FieldAccessor).componentTabs = tabs;
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanEditor', downgradeComponent({ component: PlanEditorComponent }));
