import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ExecutionTab } from '../../shared/execution-tab';
import { filter, map, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { IS_SMALL_SCREEN } from '@exense/step-core';

const ID_LIST = 'list';
const ID_OPEN = 'open';

@Component({
  selector: 'step-executions',
  templateUrl: './executions.component.html',
  styleUrls: ['./executions.component.scss'],
  providers: [
    {
      provide: ExecutionTabManagerService,
      useExisting: ExecutionsComponent,
    },
    ActiveExecutionsService,
  ],
})
export class ExecutionsComponent implements OnInit, OnDestroy, ExecutionTabManagerService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _activeExecutionsService = inject(ActiveExecutionsService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  private terminator$ = new Subject<void>();

  listTab: ExecutionTab = { label: 'Executions', type: 'list', id: ID_LIST, title: 'Executions List' };
  tabs: ExecutionTab[] = [this.listTab];
  activeTab?: ExecutionTab;

  ngOnInit(): void {
    const $routeChanged = this._router.events.pipe(
      filter((event) => {
        return event instanceof NavigationEnd;
      }),
      startWith(undefined)
    );

    $routeChanged
      .pipe(
        switchMap(() => this._activatedRoute.firstChild?.url ?? of(undefined)),
        map((url) => url?.[0]?.path),
        filter((path) => !!path && this.activeTab?.id !== path),
        takeUntil(this.terminator$)
      )
      .subscribe((executionId) => this.handleLocationChange(executionId!));
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  handleTabChange(id: string): void {
    const commands = id === ID_LIST ? ['.', ID_LIST] : ['.', 'open', id];
    this._router.navigate(commands, { relativeTo: this._activatedRoute, queryParamsHandling: 'preserve' });
  }

  handleTabClose(tabId: string, openList: boolean = true): void {
    const indexToBeDeleted = this.tabs.findIndex((tab) => tab.id === tabId);
    if (indexToBeDeleted < 0) {
      return;
    }
    this.tabs.splice(indexToBeDeleted, 1);
    if (openList) {
      this.handleTabChange(this.listTab.id);
    }
    if (tabId !== ID_LIST) {
      this._activeExecutionsService.removeActiveExecution(tabId);
    }
  }

  private handleLocationChange(executionId: string): void {
    if (executionId === ID_OPEN) {
      return;
    }
    let executionTab = this.tabs.find((tab) => tab.id === executionId);
    if (!executionTab) {
      executionTab = {
        id: executionId,
        label: executionId,
        type: 'progress',
        title: '',
      };
      if (executionId !== ID_LIST) {
        const activeExecution = this._activeExecutionsService.getActiveExecution(executionId);
        activeExecution.execution$.subscribe((execution) => {
          executionTab!.title = execution.description;
          executionTab!.execution = execution;
        });
      }
      this.tabs.push(executionTab);
    }
    this.activeTab = executionTab;
  }
}
