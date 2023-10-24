import { Component, inject, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { PlanEditorApiService } from '../../../plan-editor/injectables/plan-editor-api.service';
import { PurePlanEditApiService } from '../../injectables/pure-plan-edit-api.service';
import { ActivatedRoute } from '@angular/router';

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
  private _activatedRoute = inject(ActivatedRoute);
  readonly id = this._activatedRoute.snapshot.params['id'];
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanEditor', downgradeComponent({ component: PlanEditorComponent }));
