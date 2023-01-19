import {
  Component,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractArtefact,
  AJS_LOCATION,
  AJS_MODULE,
  AuthService,
  CallFunction,
  DialogsService,
  KeywordsService,
  LinkProcessorService,
  Mutable,
  Plan,
  PlansService,
  RepositoryObjectReference,
  TreeStateService,
  Function as KeywordCall,
  TreeNodeUtilsService,
  AugmentedScreenService,
  ArtefactTreeNode,
  PlanEditorService,
  PlanInteractiveSessionService,
  PlanArtefactResolverService,
  ExportDialogsService,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PlanHistoryService } from '../../services/plan-history.service';
import { catchError, filter, from, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ILocationService } from 'angular';
import { InteractiveSessionService } from '../../services/interactive-session.service';
import { KeywordCallsComponent } from '../../../execution/components/keyword-calls/keyword-calls.component';
import { FunctionDialogsService } from '../../../function/services/function-dialogs.service';
import { DOCUMENT } from '@angular/common';
import { ArtefactTreeNodeUtilsService } from '../../services/artefact-tree-node-utils.service';
import { RestoreDialogsService } from '../../services/restore-dialogs.service';

type FieldAccessor = Mutable<Pick<PlanEditorComponent, 'repositoryObjectRef' | 'componentTabs' | 'planClass'>>;

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ArtefactTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: ArtefactTreeNodeUtilsService,
    },
    TreeStateService,
    PlanHistoryService,
    InteractiveSessionService,
    {
      provide: PlanInteractiveSessionService,
      useExisting: forwardRef(() => PlanEditorComponent),
    },
    {
      provide: PlanArtefactResolverService,
      useExisting: forwardRef(() => PlanEditorComponent),
    },
  ],
})
export class PlanEditorComponent
  implements OnInit, OnChanges, OnDestroy, PlanInteractiveSessionService, PlanArtefactResolverService
{
  private terminator$ = new Subject<unknown>();

  @ViewChild('keywordCalls', { read: KeywordCallsComponent, static: false })
  private keywords?: KeywordCallsComponent;

  @Input() planId?: string;

  readonly componentTabs = [
    { id: 'controls', label: 'Controls' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'other', label: 'Other Plans' },
  ];

  selectedTab = 'controls';

  readonly isInteractiveSessionActive$ = this._interactiveSession.isActive$;

  readonly repositoryObjectRef?: RepositoryObjectReference;

  readonly planClass?: string;

  constructor(
    public _interactiveSession: InteractiveSessionService,
    private _treeState: TreeStateService<AbstractArtefact, ArtefactTreeNode>,
    private _planHistory: PlanHistoryService,
    private _planApi: PlansService,
    private _keywordCallsApi: KeywordsService,
    private _screenTemplates: AugmentedScreenService,
    private _authService: AuthService,
    private _exportDialogs: ExportDialogsService,
    private _dialogsService: DialogsService,
    private _linkProcessor: LinkProcessorService,
    private _functionDialogs: FunctionDialogsService,
    public _planEditService: PlanEditorService,
    private _restoreDialogsService: RestoreDialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnInit(): void {
    this._interactiveSession.init();
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
    if (!this.planId) {
      return;
    }
    this._exportDialogs
      .displayExportDialog(
        'Plans export',
        `plans/${this.planId}`,
        `${this._planEditService.plan!.attributes!['name']}.sta`
      )
      .subscribe();
  }

  restoreVersion(): void {
    if (!this.planId) {
      return;
    }

    this._restoreDialogsService
      .showRestoreDialog(this.planId!, this._planEditService.plan!.customFields!['versionId'])
      .subscribe((restoredVersion) => {
        if (restoredVersion) {
          this.loadPlan(this.planId!);
        }
      });
  }

  clonePlan(): void {
    if (!this.planId) {
      return;
    }
    const name = this._planEditService.plan!.attributes!['name'];
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
        .lookupPlan(this.planId!, artefact!.id!)
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
            return this.openFunctionEditor(keyword as KeywordCall);
          })
        )
        .subscribe();
    }
  }

  execute(): void {
    const artefactIds = this._treeState.getSelectedNodes().map((node) => node.id!);

    this._interactiveSession.execute(this.planId!, artefactIds).subscribe(() => {
      if (this.keywords) {
        this.keywords.leafReportsDataSource.reload();
      }
    });
  }

  private loadPlan(planId: string): void {
    if (!planId) {
      return;
    }
    this._planApi
      .getPlanById(planId)
      .pipe(
        tap((plan) => {
          if (plan.root) {
            this.synchronizeDynamicName(plan.root);
          }
        })
      )
      .subscribe((plan) => {
        (this as FieldAccessor).planClass = plan._class;
        this._planEditService.init(plan);
      });
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

  private openPlan(plan: Plan): Observable<unknown> {
    const planId = plan!.id!;
    const project = plan!.attributes!['project'];
    return from(this._linkProcessor.process(project)).pipe(
      catchError((errorMessage) => {
        this._dialogsService.showErrorMsg(errorMessage);
        return of(undefined);
      }),
      tap((isSuccess) => {
        if (isSuccess) {
          // for some reason location change isn't enough for reopen editor
          // that's why the document reload was added
          // It should gone, after the route will be refactored
          this._location.path(`/root/plans/editor/${planId}`);
          setTimeout(() => {
            this._document.location.reload();
          }, 100);
        }
      })
    );
  }

  private openFunctionEditor(keyword: KeywordCall): Observable<unknown> {
    const keywordId = keyword!.id!;
    const project = keyword!.attributes!['project'];
    return this._functionDialogs.openFunctionEditor(keywordId).pipe(
      switchMap((isSuccess) => {
        if (isSuccess) {
          return from(this._linkProcessor.process(project)).pipe(map(() => isSuccess));
        }
        return of(undefined);
      })
    );
  }

  private synchronizeDynamicName(artefact: AbstractArtefact): void {
    if (artefact.dynamicName) {
      artefact.dynamicName.dynamic = artefact.useDynamicName;
    }
    (artefact.children || []).forEach((child) => this.synchronizeDynamicName(child));
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanEditor', downgradeComponent({ component: PlanEditorComponent }));
