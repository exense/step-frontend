import { Component, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { PlanEditorApiService } from '../../../plan-editor/plan-editor.module';
import { CompositeKeywordPlanApiService } from '../../services/composite-keyword-plan-api.service';

@Component({
  selector: 'step-composite-function-editor',
  templateUrl: './composite-function-editor.component.html',
  styleUrls: ['./composite-function-editor.component.scss'],
  providers: [
    {
      provide: PlanEditorApiService,
      useClass: CompositeKeywordPlanApiService,
    },
  ],
})
export class CompositeFunctionEditorComponent {
  @Input() id?: string;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepCompositeFunctionEditor', downgradeComponent({ component: CompositeFunctionEditorComponent }));
