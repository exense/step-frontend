import { ChangeDetectorRef, Component, DestroyRef, forwardRef, inject, OnInit } from '@angular/core';
import { PurePlanContextApiService } from '../../injectables/pure-plan-context-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import {
  Plan,
  PlanEditorService,
  ExecutiontTaskParameters,
  ScheduledTaskTemporaryStorageService,
  ReloadableDirective,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SchedulerInvokerService } from '../../../execution/execution.module';

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  hostDirectives: [ReloadableDirective],
  providers: [
    {
      provide: SchedulerInvokerService,
      useExisting: forwardRef(() => PlanEditorComponent),
    },
  ],
  standalone: false,
})
export class PlanEditorComponent implements OnInit, SchedulerInvokerService {
  private _destroyRef = inject(DestroyRef);
  private _cd = inject(ChangeDetectorRef);
  private _purePlanContextApi = inject(PurePlanContextApiService);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  readonly _planEditorService = inject(PlanEditorService);

  readonly initialPlanContext$ = this._activatedRoute.data.pipe(
    map((data) => data['plan'] as Plan),
    map((plan) => this._purePlanContextApi.createContext(plan)),
  );

  ngOnInit(): void {
    this._planEditorService.strategyChanged$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._cd.detectChanges());
  }

  launchPlan(): void {
    this._router.navigate(['.', 'launch'], { relativeTo: this._activatedRoute });
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['.', 'schedule', temporaryId], { relativeTo: this._activatedRoute });
  }
}
