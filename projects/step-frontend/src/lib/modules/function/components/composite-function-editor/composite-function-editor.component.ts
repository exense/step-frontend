import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { Keyword, PlanContext, PlanContextApiService, PlanEditorService, ReloadableDirective } from '@exense/step-core';
import { CompositeKeywordPlanContextApiService } from '../../injectables/composite-keyword-plan-context-api.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-composite-function-editor',
  templateUrl: './composite-function-editor.component.html',
  styleUrls: ['./composite-function-editor.component.scss'],
  hostDirectives: [ReloadableDirective],
  providers: [
    {
      provide: PlanContextApiService,
      useExisting: CompositeKeywordPlanContextApiService,
    },
  ],
  standalone: false,
})
export class CompositeFunctionEditorComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _cd = inject(ChangeDetectorRef);
  private _activatedRoute = inject(ActivatedRoute);
  protected readonly _planEditorService = inject(PlanEditorService);

  protected readonly initialCompositePlanContext$ = this._activatedRoute.data.pipe(
    map((data) => data['compositePlan'] as PlanContext | undefined),
  );

  protected readonly actualKeyword = computed(() => {
    return this._planEditorService.planContext()?.entity as unknown as Keyword;
  });

  ngOnInit(): void {
    this._planEditorService.strategyChanged$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._cd.detectChanges());
  }

  protected handleKeywordChange(keyword: Keyword): void {
    const ctx = this._planEditorService.planContext();
    if (!ctx) {
      return;
    }
    this._planEditorService.handlePlanContextChange({ ...ctx, entity: keyword });
  }
}
