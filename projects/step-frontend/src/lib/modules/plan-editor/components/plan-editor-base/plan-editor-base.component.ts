import {
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
  AJS_LOCATION,
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
  PlansService,
  RepositoryObjectReference,
  RestoreDialogsService,
  TreeNodeUtilsService,
  TreeStateService,
  ArtefactService,
  PlanLinkDialogService,
  FunctionActionsService,
  PlanOpenService,
} from '@exense/step-core';
import {
  catchError,
  defer,
  EMPTY,
  debounceTime,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { KeywordCallsComponent } from '../../../execution/components/keyword-calls/keyword-calls.component';
import { ArtefactTreeNodeUtilsService } from '../../injectables/artefact-tree-node-utils.service';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { PlanHistoryService } from '../../injectables/plan-history.service';
import { PlanEditorApiService } from '../../injectables/plan-editor-api.service';

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
  ],
})
export class PlanEditorBaseComponent
  implements OnInit, OnChanges, OnDestroy, PlanInteractiveSessionService, PlanArtefactResolverService
{
  readonly _interactiveSession = inject(InteractiveSessionService);
  private _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private _planEditorApi = inject(PlanEditorApiService);
  private _planApi = inject(PlansService);
  private _keywordCallsApi = inject(KeywordsService);
  private _dialogsService = inject(DialogsService);
  private _functionActions = inject(FunctionActionsService);
  private _planLinkDialogs = inject(PlanLinkDialogService, { optional: true });
  private _artefactService = inject(ArtefactService);
  public _planEditService = inject(PlanEditorService);
  private _restoreDialogsService = inject(RestoreDialogsService);
  private _$location = inject(AJS_LOCATION);
  private _planOpen = inject(PlanOpenService);

  private get artefactIdFromUrl(): string | undefined {
    const { artefactId } = this._$location.search() || {};
    return artefactId;
  }

  @Input() id?: string;
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

  ngOnInit(): void {
    this._interactiveSession.init();
    this.initConsoleTabToggle();
    this.initPlanTypeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cId = changes['id'];
    if (cId?.previousValue !== cId?.currentValue || cId?.firstChange) {
      this.loadPlan(cId?.currentValue, true);
      this.repositoryObjectRef = this._planEditorApi.createRepositoryObjectReference(cId?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
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
    if (!this.id) {
      return;
    }
    this._planEditorApi.exportPlan(this.id, `${this._planEditService.plan!.attributes!['name']}.sta`).subscribe();
  }

  displayHistory(permission: string, plan: Plan): void {
    if (!(plan?.id || this.id)) {
      return;
    }

    const versionHistory = this._planEditorApi.getPlanHistory(this.id || plan.id!);

    const currentVersion$ = defer(() => {
      if (this.id && this.id !== plan.id) {
        // composite keywords need to retrieve the current version
        return this._keywordCallsApi
          .getFunctionById(this.id)
          .pipe(map((keyword) => keyword?.customFields?.['versionId'] ?? undefined));
      } else {
        // we are showing a real plan
        return of(plan.customFields ? plan.customFields['versionId'] : undefined);
      }
    });

    currentVersion$
      .pipe(
        switchMap((currentVersion) =>
          this._restoreDialogsService.showRestoreDialog(currentVersion, versionHistory, permission)
        ),
        filter((restoreVersion) => restoreVersion !== undefined),
        switchMap((restoreVersion) => this._planEditorApi.restorePlanVersion(this.id || plan.id!, restoreVersion)),
        catchError((error) => {
          console.error(error);
          return EMPTY;
        })
      )
      .subscribe(() => this.loadPlan(this.id || plan.id!));
  }

  clonePlan(): void {
    if (!this.id) {
      return;
    }
    const name = this._planEditService.plan!.attributes!['name'];
    this._dialogsService.enterValue('Clone plan as', `${name}_Copy`, 'md', 'enterValueDialog', (value: string) => {
      this._planEditorApi
        .clonePlan(this.id!)
        .pipe(
          map((plan) => {
            plan!.attributes!['name'] = value;
            return plan;
          }),
          switchMap((plan) => this._planEditorApi.savePlan(plan)),
          map(({ id }) => id)
        )
        .subscribe((id) => {
          this._planEditorApi.navigateToPlan(id);
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
    this._interactiveSession.resetInteractive().subscribe();
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
        .lookupPlan(this.id!, artefact!.id!)
        .pipe(
          map((plan) => plan || NO_DATA),
          catchError((err) => {
            console.error(err);
            return of(undefined);
          }),
          switchMap((plan) => {
            if (!plan) {
              this._dialogsService.showErrorMsg('The related plan was not found');
              return of(undefined);
            }

            if (plan.toString() === NO_DATA) {
              this._dialogsService.showErrorMsg('No editor configured for this plan type');
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
              this._dialogsService.showErrorMsg('The related keyword was not found');
              return of('');
            }
            if (keyword.toString() === NO_DATA) {
              this._dialogsService.showErrorMsg('No editor configured for this function type');
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

    this._interactiveSession.execute(this.id!, artefactIds).subscribe(() => {
      if (this.keywords) {
        this.keywords._leafReportsDataSource.reload();
      }
    });
  }

  private loadPlan(id?: string, preselectArtefact?: boolean): void {
    if (!id) {
      return;
    }

    this._planEditorApi
      .loadPlan(id)
      .pipe(
        tap((plan) => {
          if (plan.root) {
            this.synchronizeDynamicName(plan.root);
          }
        })
      )
      .subscribe((plan) => {
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
      });
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
