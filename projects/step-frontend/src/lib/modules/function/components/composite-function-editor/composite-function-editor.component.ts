import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { Keyword, Plan, PlanContext, PlanContextApiService, PlanEditorService } from '@exense/step-core';
import { CompositeKeywordPlanContextApiService } from '../../injectables/composite-keyword-plan-context-api.service';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-composite-function-editor',
  templateUrl: './composite-function-editor.component.html',
  styleUrls: ['./composite-function-editor.component.scss'],
  providers: [
    {
      provide: PlanContextApiService,
      useExisting: CompositeKeywordPlanContextApiService,
    },
  ],
})
export class CompositeFunctionEditorComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _cd = inject(ChangeDetectorRef);
  private _activatedRoute = inject(ActivatedRoute);
  readonly _planEditorService = inject(PlanEditorService);

  readonly initialCompositePlanContext$ = this._activatedRoute.data.pipe(
    map((data) => data['compositePlan'] as PlanContext | undefined),
  );

  readonly hasFunctionPackage$ = this.initialCompositePlanContext$.pipe(
    map((context) => context?.entity as unknown as Keyword),
    map((keyword) => !!keyword?.customFields?.['functionPackageId']),
  );

  protected readonly actualKeyword = computed(() => {
    return this._planEditorService.planContext()?.entity as unknown as Keyword;
  });

  ngOnInit(): void {
    this._planEditorService.strategyChanged$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._cd.detectChanges());
  }

  handleKeywordChange(keyword: Keyword): void {
    const ctx = this._planEditorService.planContext();
    if (!ctx) {
      return;
    }
    this._planEditorService.handlePlanContextChange({ ...ctx, entity: keyword });
  }
}
