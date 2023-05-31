import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AugmentedKeywordsService, Function as KeywordFunction } from '@exense/step-core';
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

  private _functionApiService = inject(AugmentedKeywordsService);

  protected composite?: KeywordFunction;

  ngOnChanges(changes: SimpleChanges): void {
    const cId = changes['id'];
    if (cId?.previousValue !== cId?.currentValue || cId?.firstChange) {
     this.loadKeyword(cId?.currentValue);
    }
  }
  
  private loadKeyword(id?: string): void {
      if (!id) {
         this.composite = undefined;
         return;
      }
      this._functionApiService.getFunctionById(id).subscribe((keywordFunction) => {
        this.composite = keywordFunction;
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepCompositeFunctionEditor', downgradeComponent({ component: CompositeFunctionEditorComponent }));
