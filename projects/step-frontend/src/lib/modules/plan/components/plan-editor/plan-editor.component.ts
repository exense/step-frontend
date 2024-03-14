import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PurePlanContextApiService } from '../../injectables/pure-plan-context-api.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Plan, PlanContextApiService, PlanEditorService } from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  providers: [
    {
      provide: PlanContextApiService,
      useExisting: PurePlanContextApiService,
    },
  ],
})
export class PlanEditorComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _cd = inject(ChangeDetectorRef);
  private _purePlanContextApi = inject(PurePlanContextApiService);

  readonly _planEditorService = inject(PlanEditorService);

  readonly _initialPlanContext$ = inject(ActivatedRoute).data.pipe(
    map((data) => data['plan'] as Plan),
    map((plan) => this._purePlanContextApi.createContext(plan)),
  );

  ngOnInit(): void {
    this._planEditorService.strategyChanged$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._cd.detectChanges());
  }
}
