import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  ArtefactInfo,
  AuthService,
  ControllerService,
  RepositoryObjectReference,
} from '@exense/step-core';
import { noop } from 'rxjs';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { ActivatedRoute } from '@angular/router';
import { RepositoryPlanTestcaseListComponent } from '../repository-plan-testcase-list/repository-plan-testcase-list.component';

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit, OnDestroy {
  private _$rootScope = inject(AJS_ROOT_SCOPE);

  private _auth = inject(AuthService);
  private _controllersApi = inject(ControllerService);
  private _activatedRoute = inject(ActivatedRoute);

  private cancelRootScopeEvent: () => void = noop;

  protected reload: boolean = true;

  @ViewChild('planTestcaseListComponent')
  readonly planTestCases?: RepositoryPlanTestcaseListComponent;

  protected loading: boolean = false;
  protected isolateExecution: boolean = false;

  protected repoRef?: RepositoryObjectReference;

  protected artefact?: ArtefactInfo;

  protected error?: Error;

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
      this.reload = false;
      setTimeout(() => (this.reload = true));
    });
  }

  private setupLocationParams(): void {
    const search = this._activatedRoute.snapshot.queryParams;
    this.isolateExecution = !!search.isolate;

    if (search['user']) {
      this._auth.updateContext({ userID: search['user'] });
    }

    if (search['repositoryId']) {
      this.repoRef = {
        repositoryID: search['repositoryId'],
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
    this.loading = true;
    this._controllersApi.getArtefactInfo(this.repoRef).subscribe({
      next: (artefact) => (this.artefact = artefact),
      error: (error) => (this.error = error),
      complete: () => (this.loading = false),
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepRepository', downgradeComponent({ component: RepositoryComponent }));
