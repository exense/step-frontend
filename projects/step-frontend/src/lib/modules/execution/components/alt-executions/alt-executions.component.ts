import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  CustomMenuEntriesService,
  ExecutionViewMode,
  ExecutionViewModeService,
  IS_SMALL_SCREEN,
  provideExecutionViewMode,
} from '@exense/step-core';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { filter, map, of, startWith, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const URL_PREFIX = 'executions';
const LEGACY_URL_PREFIX = 'legacy-executions';
const MENU_ENTRY_ID = 'executions';
const MAX_OPENED_EXECUTIONS = 5;

@Component({
  selector: 'step-alt-executions',
  templateUrl: './alt-executions.component.html',
  styleUrl: './alt-executions.component.scss',
  providers: [
    provideExecutionViewMode(),
    {
      provide: ExecutionTabManagerService,
      useExisting: AltExecutionsComponent,
    },
    ActiveExecutionsService,
  ],
})
export class AltExecutionsComponent implements OnInit, ExecutionTabManagerService {
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _activeExecutionsService = inject(ActiveExecutionsService);
  private _customMenuEntries = inject(CustomMenuEntriesService);
  private _executionViewMode = inject(ExecutionViewModeService);

  private activeExecutionId?: string;

  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  ngOnInit(): void {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(undefined),
        switchMap(() => this._activatedRoute.firstChild?.url ?? of(undefined)),
        map((url) => url?.[0].path),
        filter((path) => !!path && this.activeExecutionId !== path),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((executionId) => this.handleLocationChange(executionId!));

    this._customMenuEntries.removeEntry$
      .pipe(
        tap((removedEntryId) => console.log('removedEntryId', removedEntryId)),
        filter(
          (removedEntryId) => removedEntryId.startsWith(URL_PREFIX) || removedEntryId.startsWith(LEGACY_URL_PREFIX),
        ),
        map((removedEntryId) => removedEntryId.split('/')[1]),
        filter((executionId) => !!executionId && this._activeExecutionsService.hasExecution(executionId)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((executionId) => {
        this._activeExecutionsService.removeActiveExecution(executionId);
        const prefix = this._executionViewMode.mode === ExecutionViewMode.NEW ? URL_PREFIX : LEGACY_URL_PREFIX;
        if (executionId === this.activeExecutionId) {
          this._router.navigateByUrl(`/${prefix}/list`);
          this.activeExecutionId = undefined;
        }
      });
  }

  handleTabClose(tabId: string, openList?: boolean): void {
    this._customMenuEntries.remove(`${URL_PREFIX}/${tabId}`);
    this._customMenuEntries.remove(`${LEGACY_URL_PREFIX}/${tabId}`);

    if (openList) {
      this._router.navigateByUrl(`/${URL_PREFIX}/list`);
    }
  }

  private handleLocationChange(executionId: string): void {
    if (executionId === 'list') {
      this.activeExecutionId = undefined;
      return;
    }

    this.activeExecutionId = executionId;

    if (this._customMenuEntries.has(executionId)) {
      return;
    }

    this._activeExecutionsService
      .getActiveExecution(executionId)
      .execution$.pipe(take(1))
      .subscribe((execution) => {
        if (this._activeExecutionsService.size() > MAX_OPENED_EXECUTIONS) {
          const tabToClose = this._activeExecutionsService.activeExecutionIds()[0];
          this.handleTabClose(tabToClose);
        }

        let executionUrl = this._executionViewMode.determineUrl(execution);
        if (executionUrl.startsWith('/')) {
          executionUrl = executionUrl.substring(1);
        }

        this._customMenuEntries.add(MENU_ENTRY_ID, executionUrl, execution.description ?? executionId);
      });
  }
}
