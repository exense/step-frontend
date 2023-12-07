import { Component, inject, OnInit } from '@angular/core';
import { AugmentedKeywordsService, Keyword } from '@exense/step-core';
import { PlanEditorApiService } from '../../../plan-editor/plan-editor.module';
import { CompositeKeywordPlanApiService } from '../../services/composite-keyword-plan-api.service';
import { ActivatedRoute } from '@angular/router';

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
export class CompositeFunctionEditorComponent implements OnInit {
  private _functionApiService = inject(AugmentedKeywordsService);
  protected _id: string | undefined = inject(ActivatedRoute).snapshot.params['id'];

  protected composite?: Keyword;

  ngOnInit(): void {
    this.loadKeyword(this._id);
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
