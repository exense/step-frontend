import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
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
  PlanLinkDialogService,
  FunctionActionsService,
  PlanOpenService,
  PlanSetupService,
  PlanEditorApiService,
  PlanEditorPersistenceStateService,
  AugmentedPlansService,
} from '@exense/step-core';
import { catchError, debounceTime, filter, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { KeywordCallsComponent } from '../../../execution/components/keyword-calls/keyword-calls.component';
import { ArtefactTreeNodeUtilsService } from '../../injectables/artefact-tree-node-utils.service';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { PlanHistoryService } from '../../injectables/plan-history.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PlanSourceDialogComponent } from '../plan-source-dialog/plan-source-dialog.component';

const PLAN_SIZE = 'PLAN_SIZE';
const PLAN_CONTROLS_SIZE = 'PLAN_CONTROLS_SIZE';

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
    TreeStateService,
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
      provide: PlanSetupService,
      useExisting: forwardRef(() => PlanEditorBaseComponent),
    },
  ],
})
export class PlanEditorBaseComponent
  implements OnInit, OnChanges, OnDestroy, PlanInteractiveSessionService, PlanArtefactResolverService, PlanSetupService
{
  readonly _interactiveSession = inject(InteractiveSessionService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planEditorApi = inject(PlanEditorApiService);
  private _planApi = inject(AugmentedPlansService);
  private _keywordCallsApi = inject(KeywordsService);
  private _dialogsService = inject(DialogsService);
  private _functionActions = inject(FunctionActionsService);
  private _planLinkDialogs = inject(PlanLinkDialogService, { optional: true });
  private _artefactService = inject(ArtefactService);
  public _planEditService = inject(PlanEditorService);
  private _activatedRoute = inject(ActivatedRoute);
  private _planOpen = inject(PlanOpenService);
  private _planEditorPersistenceState = inject(PlanEditorPersistenceStateService);
  private _matDialog = inject(MatDialog);
  private _cd = inject(ChangeDetectorRef);

  private get artefactIdFromUrl(): string | undefined {
    const { artefactId } = this._activatedRoute.snapshot.queryParams ?? {};
    return artefactId;
  }

  private get currentPlanId(): string | undefined {
    return this.compositeId ?? this.initialPlan?.id;
  }

  @Input() compositeId?: string;
  @Input() initialPlan?: Plan | null;
  @Input() showExecuteButton = true;

  selectedTab = 'controls';

  readonly isInteractiveSessionActive$ = this._interactiveSession.isActive$;
  readonly showInteractiveWarning$ = this.isInteractiveSessionActive$.pipe(debounceTime(300));

  planTypes$ = this._planApi.getArtefactTemplates().pipe(
    map((planTypes) => {
      return planTypes.map((planType) => ({
        planType,
        icon: this._artefactService.getArtefactType(planType)?.icon ?? '',
      }));
    })
  );
  planTypeControl = new FormControl<{ planType: string; icon: string } | null>(null);
  protected componentTabs = [
    { id: 'controls', label: 'Controls' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'other', label: 'Other Plans' },
  ];
  protected repositoryObjectRef?: RepositoryObjectReference;

  protected planClass?: string;
  private terminator$ = new Subject<void>();
  @ViewChild('keywordCalls', { read: KeywordCallsComponent, static: false })
  private keywords?: KeywordCallsComponent;

  protected planSize = this._planEditorPersistenceState.getPanelSize(PLAN_SIZE);
  protected planControlsSize = this._planEditorPersistenceState.getPanelSize(PLAN_CONTROLS_SIZE);

  ngOnInit(): void {
    this._interactiveSession.init();
    this.initConsoleTabToggle();
    this.initPlanTypeChanges();
    this._planEditService.strategyChanged$.pipe(takeUntil(this.terminator$)).subscribe(() => this._cd.detectChanges());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cPlan = changes['initialPlan'];
    if (cPlan?.previousValue !== cPlan?.currentValue || cPlan?.firstChange) {
      this.setupPlan(cPlan?.currentValue, true);
      this.repositoryObjectRef = this._planEditorApi.createRepositoryObjectReference((cPlan?.currentValue as Plan)?.id);
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  handlePlanSizeChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(PLAN_SIZE, size);
  }

  handlePlanControlsChange(size: number): void {
    this._planEditorPersistenceState.setPanelSize(PLAN_CONTROLS_SIZE, size);
  }

  addControl(artefactTypeId: string): void {
    this._planEditService.addControl(artefactTypeId);
  }

  addFunction(keywordId: string): void {
    this._planEditService.addFunction(keywordId);
  }

  addPlan(planId: string): void {
    this._planEditService.addPlan(planId);
  }

  exportPlan(): void {
    if (!this.currentPlanId) {
      return;
    }
    this._planEditorApi
      .exportPlan(this.currentPlanId, `${this._planEditService.plan!.attributes!['name']}.sta`)
      .subscribe();
  }

  clonePlan(): void {
    if (!this.currentPlanId) {
      return;
    }

    const name = this._planEditService.plan!.attributes!['name'];

    this._dialogsService
      .enterValue('Clone plan as', `${name}_Copy`)
      .pipe(
        switchMap((value) =>
          this._planEditorApi.clonePlan(this.currentPlanId!).pipe(
            switchMap((plan) => this._planEditorApi.renamePlan(plan, value)),
            map(({ plan }) => plan.id)
          )
        )
      )
      .subscribe((id) => {
        if (!id) {
          return;
        }
        this._planEditorApi.navigateToPlan(id!, true);
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
    const isPlan = artefact._class === 'CallPlan';
    const isKeyword = artefact._class === 'CallKeyword';

    const NO_DATA = 'NO_DATA';

    if (isPlan) {
      this._planApi
        .lookupPlan(this.currentPlanId!, artefact!.id!)
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

            return this.openPlan(plan as Plan);
          })
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
          })
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

  setupPlan(plan?: Plan, preselectArtefact?: boolean): void {
    if (!plan) {
      return;
    }

    if (plan.root) {
      this.synchronizeDynamicName(plan.root);
    }

    this.planClass = plan._class;
    this.planTypeControl.setValue(
      {
        planType: plan.root!._class,
        icon: this._artefactService.getArtefactType(plan.root!._class)!.icon,
      },
      { emitEvent: false }
    );

    const planOpenState = this._planOpen.getLastPlanOpenState();
    const artefactId = preselectArtefact ? planOpenState?.artefactId ?? this.artefactIdFromUrl : undefined;
    this._planEditService.init(plan, artefactId);
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
        takeUntil(this.terminator$)
      )
      .subscribe(({ tabs, withConsole }) => {
        this.componentTabs = tabs;
        if (withConsole) {
          this.selectedTab = consoleTab.id;
        }
      });
  }

  private openPlan(plan: Plan): Observable<unknown> {
    if (!this._planLinkDialogs) {
      return of(undefined);
    }
    return this._planLinkDialogs.editPlan(plan);
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

  private initPlanTypeChanges(): void {
    this.planTypeControl.valueChanges
      .pipe(
        takeUntil(this.terminator$),
        map((item) => {
          const plan = this._planEditService.plan;
          return { item, plan };
        }),
        filter(({ item, plan }) => !!item && !!plan),
        map(
          ({ item, plan }) =>
            ({
              ...plan,
              root: {
                ...plan!.root,
                _class: item!.planType,
              },
            } as Plan)
        ),
        switchMap((plan) => this._planEditorApi.savePlan(plan))
      )
      .subscribe(({ plan }) => {
        this.planClass = plan._class;
        this._planEditService.init(plan);
      });
  }
}
