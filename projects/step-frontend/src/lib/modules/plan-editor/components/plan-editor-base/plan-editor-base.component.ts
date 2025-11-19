import {
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  forwardRef,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  untracked,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  AbstractArtefact,
  ArtefactRefreshNotificationService,
  ArtefactTreeNode,
  CallFunction,
  DialogsService,
  Keyword,
  KeywordsService,
  Plan,
  PlanArtefactResolverService,
  PlanEditorService,
  PlanInteractiveSessionService,
  RepositoryObjectReference,
  TreeNodeUtilsService,
  TreeStateService,
  ArtefactService,
  FunctionActionsService,
  PlanOpenService,
  PlanContextInitializerService,
  PlanContextApiService,
  PlanEditorPersistenceStateService,
  AugmentedPlansService,
  CommonEntitiesUrlsService,
  PlanContext,
  AuthService,
  ExecutionParameters,
} from '@exense/step-core';
import { catchError, debounceTime, filter, map, Observable, of, pairwise, Subject, switchMap, takeUntil } from 'rxjs';
import { KeywordCallsComponent } from '../../../execution/components/keyword-calls/keyword-calls.component';
import { ArtefactTreeNodeUtilsService } from '../../injectables/artefact-tree-node-utils.service';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { PlanHistoryService } from '../../injectables/plan-history.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PlanSourceDialogComponent } from '../plan-source-dialog/plan-source-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArtefactTreeStateService } from '../../injectables/artefact-tree-state.service';

const PLAN_SIZE = 'PLAN_SIZE';
const PLAN_CONTROLS_SIZE = 'PLAN_CONTROLS_SIZE';

export interface ActionsConfig {
  showExecuteButton?: boolean;
  showExportSourceButton?: boolean;
}

@Component({
  selector: 'step-plan-editor-base',
  templateUrl: './plan-editor-base.component.html',
  styleUrls: ['./plan-editor-base.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ArtefactTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: ArtefactTreeNodeUtilsService,
    },
    {
      provide: ArtefactRefreshNotificationService,
      useExisting: ArtefactTreeNodeUtilsService,
    },
    ArtefactTreeStateService,
    {
      provide: TreeStateService,
      useExisting: ArtefactTreeStateService,
    },
    PlanHistoryService,
    InteractiveSessionService,
    {
      provide: PlanInteractiveSessionService,
      useExisting: forwardRef(() => PlanEditorBaseComponent),
    },
    {
      provide: PlanArtefactResolverService,
      useExisting: forwardRef(() => PlanEditorBaseComponent),
    },
    {
      provide: PlanContextInitializerService,
      useExisting: forwardRef(() => PlanEditorBaseComponent),
    },
  ],
  standalone: false,
})
export class PlanEditorBaseComponent
  implements
    OnInit,
    OnChanges,
    PlanInteractiveSessionService,
    PlanArtefactResolverService,
    PlanContextInitializerService,
    OnDestroy
{
  readonly _interactiveSession = inject(InteractiveSessionService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planEditorApi = inject(PlanContextApiService);
  private _planApi = inject(AugmentedPlansService);
  private _keywordCallsApi = inject(KeywordsService);
  private _dialogsService = inject(DialogsService);
  private _functionActions = inject(FunctionActionsService);
  private _artefactService = inject(ArtefactService);
  private _activatedRoute = inject(ActivatedRoute);
  private _planOpen = inject(PlanOpenService);
  private _planEditorPersistenceState = inject(PlanEditorPersistenceStateService);
  private _matDialog = inject(MatDialog);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _destroyRef = inject(DestroyRef);
  private _auth = inject(AuthService);
  private _injector = inject(Injector);
  public _planEditorService = inject(PlanEditorService);

  private planTypeChangeTerminator$?: Subject<void>;

  private get artefactIdFromUrl(): string | undefined {
    const { artefactId } = this._activatedRoute.snapshot.queryParams ?? {};
    return artefactId;
  }

  private get currentPlanId(): string | undefined {
    return this.initialPlanContext?.id;
  }

  @Input() initialPlanContext?: PlanContext | null;
  @Input() actionsConfig?: ActionsConfig = {
    showExecuteButton: true,
    showExportSourceButton: true,
  };
  @Output() runPlan = new EventEmitter<void>();

  selectedTab = 'controls';

  readonly isInteractiveSessionActive$ = this._interactiveSession.isActive$;
  readonly showInteractiveWarning$ = this.isInteractiveSessionActive$.pipe(debounceTime(300));

  planTypes$ = this._planApi.getArtefactTemplates().pipe(
    map((planTypes) => {
      return planTypes.map((planType) => ({
        planType,
        icon: this._artefactService.getArtefactType(planType)?.icon ?? '',
      }));
    }),
  );
  protected planTypeControl = new FormControl<{ planType: string; icon: string } | null>(null);
  protected componentTabs = [
    { id: 'controls', label: 'Controls' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'other', label: 'Other Plans' },
  ];
  protected repositoryObjectRef?: RepositoryObjectReference;

  protected planClass?: string;
  @ViewChild('keywordCalls', { read: KeywordCallsComponent, static: false })
  private keywords?: KeywordCallsComponent;

  protected planSize = this._planEditorPersistenceState.getPanelSize(PLAN_SIZE);
  protected planControlsSize = this._planEditorPersistenceState.getPanelSize(PLAN_CONTROLS_SIZE);

  private effectCheckAccessToPlanTypeControl = effect(() => {
    const planEditorType = this._planEditorService.plan();
    untracked(() => {
      if (this._auth.hasRight('plan-write', this._injector)) {
        this.planTypeControl.enable({ emitEvent: false });
      } else {
        this.planTypeControl.disable({ emitEvent: false });
      }
    });
  });

  ngOnInit(): void {
    this._interactiveSession.init();
    this.initConsoleTabToggle();
  }

  ngOnDestroy() {
    this.terminatePlanTypeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cPlanCtx = changes['initialPlanContext'];
    if (cPlanCtx?.previousValue !== cPlanCtx?.currentValue || cPlanCtx?.firstChange) {
      this.initializeContext(cPlanCtx?.currentValue, true);
      this.repositoryObjectRef = this._planEditorApi.createRepositoryObjectReference(
        (cPlanCtx?.currentValue as PlanContext)?.id,
      );
    }
  }

  handlePlanSizeChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(PLAN_SIZE, size);
  }

  handlePlanControlsChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(PLAN_CONTROLS_SIZE, size);
  }

  addControl(artefactTypeId: string): void {
    this._planEditorService.addControl(artefactTypeId);
  }

  addKeywords(keywordIds: string[]): void {
    this._planEditorService.addKeywords(keywordIds);
  }

  addPlans(planIds: string[]): void {
    this._planEditorService.addPlans(planIds);
  }

  exportPlan(): void {
    if (!this.currentPlanId) {
      return;
    }
    this._planEditorApi
      .exportPlan(this.currentPlanId, `${this._planEditorService.planContext()!.entity!.attributes!['name']}.sta`)
      .subscribe();
  }

  clonePlan(): void {
    if (!this.currentPlanId) {
      return;
    }

    const name = this._planEditorService.planContext()!.entity!.attributes!['name'];

    this._dialogsService
      .enterValue('Clone plan as', `${name}_Copy`)
      .pipe(
        switchMap((newName) =>
          this._planEditorApi
            .clonePlan(this.currentPlanId!)
            .pipe(switchMap((context) => this._planEditorApi.renamePlan(context, newName))),
        ),
      )
      .subscribe((context) => {
        if (!context?.id) {
          return;
        }
        this._planEditorApi.navigateToPlan(context.id);
      });
  }

  startInteractive(): void {
    this._interactiveSession.startInteractive(this.repositoryObjectRef!).subscribe();
  }

  stopInteractive(): void {
    this._interactiveSession.stopInteractive().subscribe(() => (this.selectedTab = 'controls'));
  }

  resetInteractive(): void {
    this._interactiveSession.resetInteractive().subscribe();
  }

  showPlanSource(): void {
    this._planApi
      .getYamlPlan(this.currentPlanId!)
      .subscribe((source) => this._matDialog.open(PlanSourceDialogComponent, { data: source }));
  }

  openArtefact(node?: AbstractArtefact): void {
    if (node) {
      this._treeState.selectNodeById(node.id!);
    }

    const artefact = this._treeState.getSelectedNodes()[0]?.originalArtefact;
    const isPlan = artefact?._class === 'CallPlan';
    const isKeyword = artefact?._class === 'CallKeyword';

    const NO_DATA = 'NO_DATA';

    if (isPlan) {
      this._planEditorApi
        .lookupPlan(this._planEditorService.planContext()!.id!, artefact!.id!)
        .pipe(
          map((plan) => plan || NO_DATA),
          catchError((err) => {
            console.error(err);
            return of(undefined);
          }),
          switchMap((plan) => {
            if (!plan) {
              this._dialogsService.showErrorMsg('The related plan was not found').subscribe();
              return of(undefined);
            }

            if (plan.toString() === NO_DATA) {
              this._dialogsService.showErrorMsg('No editor configured for this plan type').subscribe();
              return of(undefined);
            }

            return this._router.navigateByUrl(this._commonEntitiesUrls.planEditorUrl(plan as Plan));
          }),
        )
        .subscribe();
    } else if (isKeyword) {
      const keyword = artefact as CallFunction;
      this._keywordCallsApi
        .lookupCallFunction(keyword)
        .pipe(
          map((keyword) => keyword || NO_DATA),
          catchError((err) => {
            console.error(err);
            return of(undefined);
          }),
          switchMap((keyword) => {
            if (!keyword) {
              this._dialogsService.showErrorMsg('The related keyword was not found').subscribe();
              return of('');
            }
            if (keyword.toString() === NO_DATA) {
              this._dialogsService.showErrorMsg('No editor configured for this function type').subscribe();
              return of('');
            }
            return this.openFunctionEditor(keyword as Keyword);
          }),
        )
        .subscribe();
    }
  }

  execute(nodeId?: string): void {
    let artefactIds: string[];
    if (nodeId) {
      this._treeState.selectNodeById(nodeId);
      artefactIds = [nodeId];
    } else {
      artefactIds = this._treeState.getSelectedNodes().map((node) => node.id!);
    }

    this._interactiveSession.execute(this.currentPlanId!, artefactIds).subscribe(() => {
      if (this.keywords) {
        this.keywords._leafReportsDataSource.reload();
      }
    });
  }

  initializeContext(context?: PlanContext, preselectArtefact?: boolean): void {
    if (!context?.plan) {
      return;
    }

    if (context.plan.root) {
      this.synchronizeDynamicName(context.plan.root);
    }

    this.planClass = context.plan._class;
    this.terminatePlanTypeChanges();
    this.planTypeControl.setValue(
      {
        planType: context!.plan!.root!._class,
        icon: this._artefactService.getArtefactType(context.plan.root!._class)!.icon,
      },
      { emitEvent: false },
    );
    this.setupPlanTypeChanges();

    const planOpenState = this._planOpen.getLastPlanOpenState();
    const artefactId = preselectArtefact ? planOpenState?.artefactId ?? this.artefactIdFromUrl : undefined;
    this._planEditorService.init(context!, artefactId);
    if (planOpenState?.startInteractive) {
      this.startInteractive();
    }
  }

  private initConsoleTabToggle(): void {
    const consoleTab = { id: 'console', label: 'Console' };
    this._interactiveSession.isActive$
      .pipe(
        filter((shouldConsoleExists) => {
          const hasConsole = this.componentTabs.some((tab) => tab.id === consoleTab.id);
          return hasConsole !== shouldConsoleExists;
        }),
        map((withConsole) => {
          const tabs = withConsole
            ? [...this.componentTabs, { ...consoleTab }]
            : this.componentTabs.filter((tab) => tab.id !== consoleTab.id);
          return { tabs, withConsole };
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(({ tabs, withConsole }) => {
        this.componentTabs = tabs;
        if (withConsole) {
          this.selectedTab = consoleTab.id;
        }
      });
  }

  private openFunctionEditor(keyword: Keyword): Observable<unknown> {
    return this._functionActions.openFunctionEditor(keyword);
  }

  private synchronizeDynamicName(artefact: AbstractArtefact): void {
    if (artefact.dynamicName) {
      artefact.dynamicName.dynamic = artefact.useDynamicName;
    }
    (artefact.children || []).forEach((child) => this.synchronizeDynamicName(child));
  }

  private terminatePlanTypeChanges(): void {
    this.planTypeChangeTerminator$?.next?.();
    this.planTypeChangeTerminator$?.complete?.();
    this.planTypeChangeTerminator$ = undefined;
  }

  private setupPlanTypeChanges(): void {
    this.terminatePlanTypeChanges();
    this.planTypeChangeTerminator$ = new Subject<void>();
    this.planTypeControl.valueChanges
      .pipe(
        map((item) => {
          const context = this._planEditorService.planContext();
          return { item, context };
        }),
        filter(({ item, context }) => !!item && !!context),
        map(({ item, context }) => {
          const contextCopy = this._planEditorApi.createContextDuplicate(context!);
          contextCopy.plan.root!._class = item!.planType;
          return contextCopy;
        }),
        switchMap((context) => this._planEditorApi.savePlan(context)),
        takeUntil(this.planTypeChangeTerminator$),
      )
      .subscribe((context) => {
        this.planClass = context!.plan!._class;
        this._planEditorService.init(context);
      });
  }

  setTargetExecutionParameters(executionParameters: ExecutionParameters) {
    this._planEditorService.setTargetExecutionParameters(executionParameters);
  }
}
