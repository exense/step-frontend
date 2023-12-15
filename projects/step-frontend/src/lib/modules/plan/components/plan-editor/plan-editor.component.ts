import { Component, inject } from '@angular/core';
import { PlanEditorApiService } from '../../../plan-editor/injectables/plan-editor-api.service';
import { PurePlanEditApiService } from '../../injectables/pure-plan-edit-api.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Plan } from '@exense/step-core';

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  providers: [
    {
      provide: PlanEditorApiService,
      useClass: PurePlanEditApiService,
    },
  ],
})
export class PlanEditorComponent {
  readonly _plan$ = inject(ActivatedRoute).data.pipe(map((data) => data['plan'] as Plan | undefined));
}
