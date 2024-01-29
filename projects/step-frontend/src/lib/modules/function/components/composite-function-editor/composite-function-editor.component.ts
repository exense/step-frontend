import { Component, inject } from '@angular/core';
import { Plan, PlanEditorApiService } from '@exense/step-core';
import { CompositeKeywordPlanApiService } from '../../injectables/composite-keyword-plan-api.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'step-composite-function-editor',
  templateUrl: './composite-function-editor.component.html',
  styleUrls: ['./composite-function-editor.component.scss'],
  providers: [
    {
      provide: PlanEditorApiService,
      useExisting: CompositeKeywordPlanApiService,
    },
  ],
})
export class CompositeFunctionEditorComponent {
  readonly _compositePlan$ = inject(ActivatedRoute).data.pipe(map((data) => data['compositePlan'] as Plan | undefined));
  protected _id: string | undefined = inject(ActivatedRoute).snapshot.params['id'];

  readonly _composite$ = inject(CompositeKeywordPlanApiService).keyword$;
}
