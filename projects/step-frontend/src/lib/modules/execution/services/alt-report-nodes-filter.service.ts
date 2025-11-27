import { computed, DestroyRef, inject, Injectable } from '@angular/core';
import { EXECUTION_ID } from './execution-id.token';
import { FormBuilder } from '@angular/forms';
import { ERROR_STATUSES, REPORT_NODE_STATUS, Status } from '../../_common/shared/status.enum';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs';
import { AltExecutionStorageService } from './alt-execution-storage.service';
import { AltExecutionViewAllService } from './alt-execution-view-all.service';
import { AltExecutionStateService } from './alt-execution-state.service';
import { DateUtilsService } from '@exense/step-core';

@Injectable()
export abstract class AltReportNodesFilterService {
  protected constructor(protected storagePrefix: string) {
    this.setupSyncWithStorage();
  }

  private _fb = inject(FormBuilder);
  protected _executionId = inject(EXECUTION_ID);
  protected _dateUtils = inject(DateUtilsService);
  private _executionStorage = inject(AltExecutionStorageService);
  private _viewAllService = inject(AltExecutionViewAllService);
  protected _executionState = inject(AltExecutionStateService);
  protected _destroyRef = inject(DestroyRef);

  readonly statusesCtrl = this._fb.nonNullable.control<Status[]>([]);

  readonly statusCtrlValue = toSignal(this.statusesCtrl.valueChanges, { initialValue: this.statusesCtrl.value });

  readonly selectedStatuses$ = this.statusesCtrl.valueChanges.pipe(
    startWith(this.statusesCtrl.value),
    map((statuses) => new Set(statuses)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly statuses = REPORT_NODE_STATUS;
  private errorStatusesSet = new Set(ERROR_STATUSES);
  readonly isFilteredByErrorStatuses = computed(() => {
    const statuses = this.statusCtrlValue() ?? [];
    return (
      statuses.length === this.errorStatusesSet.size && statuses.every((status) => this.errorStatusesSet.has(status))
    );
  });

  updateStatusCtrl(statuses: Status[], artefactClass?: string): void {
    this.statusesCtrl.setValue(statuses);
    this.artefactClassCtrl.setValue(artefactClass ? [artefactClass] : []);
  }

  toggleErrorStatuses(): void {
    const isFilteredByErrorStatuses = this.isFilteredByErrorStatuses();
    const statuses = !isFilteredByErrorStatuses ? [...ERROR_STATUSES] : [];
    this.statusesCtrl.setValue(statuses);
  }

  readonly artefactClassCtrl = this._fb.nonNullable.control<string[] | undefined>(undefined);

  readonly artefactClassArrayValue = toSignal(this.artefactClassCtrl.valueChanges, {
    initialValue: this.artefactClassCtrl.value,
  });

  readonly artefactClassValue = computed(() => {
    const value = this.artefactClassArrayValue();
    return new Set(value ?? []);
  });

  readonly artefactClass$ = this.artefactClassCtrl.valueChanges.pipe(
    startWith(this.artefactClassCtrl.value),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly searchCtrl = this._fb.control<string>('');

  readonly search$ = this.searchCtrl.valueChanges.pipe(
    startWith(this.searchCtrl.value),
    debounceTime(200),
    shareReplay(1),
    map((value) => (value ?? '').trim().toLowerCase()),
    takeUntilDestroyed(),
  );

  private get isIgnoreFilter(): boolean {
    return this._viewAllService.isViewAll;
  }

  getArtefactsText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const artefacts = this.artefactClassCtrl.value ?? [];
    if (!artefacts.length) {
      return '';
    }
    return `Artefacts: ${artefacts.join(', ')}`;
  }

  getStatusText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const statuses = this.statusesCtrl.value ?? [];
    if (!statuses.length) {
      return '';
    }
    return `Statuses: ${statuses.join(', ')}`;
  }

  getSearchText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const searchText = (this.searchCtrl.value ?? '').trim();
    if (!searchText) {
      return '';
    }
    return `Search: ${searchText}`;
  }

  private searchKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_search`;
  }

  private saveSearch(search?: string | null): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId) {
      this._executionStorage.setItem(this.searchKey(executionId), search ?? '');
    }
  }

  private restoreSearch(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.searchCtrl.setValue('');
      return;
    }
    const search = this._executionStorage.getItem(this.searchKey(executionId));
    this.searchCtrl.setValue(search ?? '');
  }

  private statusesKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_statuses`;
  }

  private saveStatuses(statuses?: Status[] | null): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId) {
      const statusesString = !!statuses?.length ? statuses.join('|') : '';
      this._executionStorage.setItem(this.statusesKey(executionId), statusesString);
    }
  }

  private restoreStatues(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.statusesCtrl.setValue([]);
      return;
    }
    const statusesString = this._executionStorage.getItem(this.statusesKey(executionId));
    if (statusesString) {
      const statuses = statusesString.split('|') as Status[];
      this.statusesCtrl.setValue(statuses);
    } else {
      this.statusesCtrl.setValue([]);
    }
  }

  private artefactClassKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_artefactClass`;
  }

  private saveArtefactClass(artefactClass?: string[]): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId) {
      const artefactClassString = !!artefactClass?.length ? artefactClass.join(',') : '';
      this._executionStorage.setItem(this.artefactClassKey(executionId), artefactClassString);
    }
  }

  private restoreArtefactClass(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.artefactClassCtrl.setValue([]);
      return;
    }
    const artefactClassString = this._executionStorage.getItem(this.artefactClassKey(executionId));
    if (artefactClassString) {
      const artefactClass = artefactClassString.split(',');
      this.artefactClassCtrl.setValue(artefactClass);
    } else {
      this.artefactClassCtrl.setValue([]);
    }
  }

  private setupSyncWithStorage(): void {
    const executionId$ = this._executionState.executionId$.pipe(distinctUntilChanged());
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([executionId$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(([executionId, isIgnoreFilter]) => {
        this.restoreSearch(executionId, isIgnoreFilter);
        this.restoreStatues(executionId, isIgnoreFilter);
        this.restoreArtefactClass(executionId, isIgnoreFilter);
      });

    this.statusesCtrl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((statuses) => this.saveStatuses(statuses));

    this.artefactClassCtrl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((artefactClass) => this.saveArtefactClass(artefactClass));

    this.searchCtrl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed(this._destroyRef))
      .subscribe((search) => this.saveSearch(search));
  }
}
