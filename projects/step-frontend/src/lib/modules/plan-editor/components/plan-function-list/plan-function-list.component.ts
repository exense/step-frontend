import { Component, inject, output, ViewEncapsulation } from '@angular/core';
import {
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  Keyword,
  selectionCollectionProvider,
  SelectionCollector,
} from '@exense/step-core';
import { map } from 'rxjs';

@Component({
  selector: 'step-plan-function-list',
  templateUrl: './plan-function-list.component.html',
  styleUrls: ['./plan-function-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [...selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.KEEP_SELECTION)],
})
export class PlanFunctionListComponent {
  private _selectionCollector = inject<SelectionCollector<string, Keyword>>(SelectionCollector);
  readonly dataSource = inject(AugmentedKeywordsService).createFilteredTableDataSource();

  readonly hasSelection$ = this._selectionCollector.length$.pipe(map((length) => length > 0));

  /** @Output **/
  addKeywords = output<string[]>();

  addKeyword(id: string): void {
    this.addKeywords.emit([id]);
  }

  addSelectedKeywords(): void {
    const ids = [...this._selectionCollector.selected];
    if (!ids.length) {
      return;
    }
    this._selectionCollector.clear();
    this.addKeywords.emit(ids);
  }
}
