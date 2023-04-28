import { Component, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { PlanEditorApiService } from '../../../plan-editor/injectables/plan-editor-api.service';
import { PurePlanEditApiServiceService } from '../../injectables/pure-plan-edit-api.service.service';

@Component({
  selector: 'step-pure-plan-editor',
  templateUrl: './pure-plan-editor.component.html',
  styleUrls: ['./pure-plan-editor.component.scss'],
  providers: [
    {
      provide: PlanEditorApiService,
      useClass: PurePlanEditApiServiceService,
    },
  ],
})
export class PurePlanEditorComponent {
  @Input() id?: string;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPurePlanEditor', downgradeComponent({ component: PurePlanEditorComponent }));
