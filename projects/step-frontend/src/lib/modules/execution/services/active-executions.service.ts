import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  AugmentedExecutionsService,
  AutoRefreshModel,
  AutoRefreshModelFactoryService,
  Execution,
} from '@exense/step-core';
import { BehaviorSubject, concatMap, filter, Observable, startWith } from 'rxjs';

export interface ActiveExecution {
  readonly executionId: string;
  readonly execution$: Observable<Execution>;
  readonly autoRefreshModel: AutoRefreshModel;
  destroy(): void;
}

class ActiveExecutionImpl implements ActiveExecution {
  constructor(
    readonly executionId: string,
    readonly autoRefreshModel: AutoRefreshModel,
    private loadExecution: (eId: string) => Observable<Execution>
  ) {
    this.setupExecutionRefresh();
  }

  private executionInternal$ = new BehaviorSubject<Execution | undefined>(undefined);

  readonly execution$ = this.executionInternal$.pipe(filter((execution) => !!execution)) as Observable<Execution>;

  destroy(): void {
    this.executionInternal$.complete();
    this.autoRefreshModel.destroy();
  }

  private setupExecutionRefresh(): void {
    this.autoRefreshModel.refresh$
      .pipe(
        startWith(() => undefined),
        concatMap(() => this.loadExecution(this.executionId))
      )
      .subscribe((execution) => {
        this.executionInternal$.next(execution);
        if (execution.status === 'ENDED') {
          this.autoRefreshModel.setDisabled(true);
          this.autoRefreshModel.setInterval(0);
          this.autoRefreshModel.setAutoIncreaseTo(0);
        }
      });
    this.autoRefreshModel.setDisabled(false);
    this.autoRefreshModel.setInterval(100);
    this.autoRefreshModel.setAutoIncreaseTo(5000);
  }
}

@Injectable()
export class ActiveExecutionsService implements OnDestroy {
  private _executionService = inject(AugmentedExecutionsService);
  private _autoRefreshFactory = inject(AutoRefreshModelFactoryService);

  private executions = new Map<string, ActiveExecution>();

  getActiveExecution(eId: string): ActiveExecution {
    if (!this.executions.has(eId)) {
      this.executions.set(eId, this.createActiveExecution(eId));
    }
    return this.executions.get(eId)!;
  }

  removeActiveExecution(eId: string): void {
    if (!this.executions.has(eId)) {
      return;
    }
    const execution = this.executions.get(eId)!;
    execution.destroy();
    this.executions.delete(eId);
  }

  ngOnDestroy(): void {
    this.executions.forEach((activeExecution) => activeExecution.destroy());
    this.executions.clear();
  }

  private createActiveExecution(eId: string): ActiveExecution {
    const autoRefreshModel = this._autoRefreshFactory.create();
    return new ActiveExecutionImpl(eId, autoRefreshModel, (eId: string) =>
      this._executionService.getExecutionById(eId)
    );
  }
}
