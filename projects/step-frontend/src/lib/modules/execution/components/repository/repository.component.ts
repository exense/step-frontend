import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  ArtefactInfo,
  AuthService,
  BulkSelectionType,
  ControllerService,
  Mutable,
  RegistrationStrategy,
  RepositoryObjectReference,
  selectionCollectionProvider,
  SelectionCollector,
  TestRunStatus,
} from '@exense/step-core';
import { ILocationService, IRootScopeService } from 'angular';
import { map, noop, Observable, of } from 'rxjs';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { IncludeTestcases } from '../../shared/include-testcases.interface';

type FieldAccessor = Mutable<
  Pick<
    RepositoryComponent,
    'reload' | 'isolateExecution' | 'repoRef' | 'loading' | 'artefact' | 'error' | 'includeTestcases$'
  >
>;

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  providers: [
    selectionCollectionProvider<string, TestRunStatus>({
      selectionKeyProperty: 'id',
      registrationStrategy: RegistrationStrategy.MANUAL,
    }),
  ],
})
export class RepositoryComponent implements OnInit, OnDestroy {
  private cancelRootScopeEvent: () => void = noop;

  readonly reload: boolean = true;

  readonly loading: boolean = false;
  readonly isolateExecution: boolean = false;

  readonly repoRef?: RepositoryObjectReference;

  readonly artefact?: ArtefactInfo;

  readonly error?: Error;

  readonly includeTestcases$: Observable<IncludeTestcases | undefined> = of(undefined);
  public testcaseSelectionType: BulkSelectionType = BulkSelectionType.NONE;

  constructor(
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService,
    @Inject(AJS_LOCATION) private _$location: ILocationService,
    private _auth: AuthService,
    private _controllersApi: ControllerService,

    protected _selectionCollector: SelectionCollector<string, TestRunStatus>
  ) {}

  ngOnInit(): void {
    this.setupReloadLogic();
    this.setupLocationParams();
    this.loadArtefact();
  }

  ngOnDestroy(): void {
    this.cancelRootScopeEvent();
  }

  private setupReloadLogic(): void {
    this.cancelRootScopeEvent = this._$rootScope.$on('$locationChangeSuccess', () => {
      (this as FieldAccessor).reload = false;
      setTimeout(() => ((this as FieldAccessor).reload = true));
    });
  }

  private setupLocationParams(): void {
    const search = this._$location.search();
    (this as FieldAccessor).isolateExecution = !!search.isolate;

    if (search.user) {
      this._auth.updateContext({ userID: search.user });
    }

    if (search.repositoryId) {
      (this as FieldAccessor).repoRef = {
        repositoryID: search.repositoryId,
        repositoryParameters: Object.entries(search).reduce((result, [key, value]) => {
          if (!['repositoryId', 'tenant'].includes(key)) {
            result[key] = value as string;
          }
          return result;
        }, {} as Record<string, string>),
      };
    }
  }

  private loadArtefact(): void {
    const fieldAccessor = this as FieldAccessor;
    fieldAccessor.loading = true;
    this._controllersApi.getArtefactInfo(this.repoRef).subscribe(
      (artefact) => {
        fieldAccessor.artefact = artefact;
        this.setupTestCases();
      },
      (error) => (fieldAccessor.error = error),
      () => (fieldAccessor.loading = false)
    );
  }

  protected setupTestCases(): void {
    if (this.artefact!.type !== 'TestSet') {
      return;
    }
    const isBy = (): 'id' | 'name' | 'all' => {
      let by = this.repoRef!.repositoryID === 'local' ? 'id' : 'name';

      // @ts-ignore
      return this.testcaseSelectionType === 'ALL' ? 'all' : by;
    };

    (this as FieldAccessor).includeTestcases$ = this._selectionCollector.selected$.pipe(
      map((list) => list as string[]),
      map((list) => ({ by: isBy(), list }))
    );
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepRepository', downgradeComponent({ component: RepositoryComponent }));
