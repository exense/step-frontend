import { Component, EventEmitter, inject, output, Output, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  Keyword,
  Plan,
  selectionCollectionProvider,
  SelectionCollector,
} from '@exense/step-core';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.KEEP_SELECTION)],
})
export class PlanOtherplanListComponent {
  private _selectionCollector = inject<SelectionCollector<string, Plan>>(SelectionCollector);

  readonly dataSource = inject(AugmentedPlansService).getPlansTableDataSource();

  /** @Output **/
  addPlans = output<string[]>();

  addPlan(id: string): void {
    this.addPlans.emit([id]);
  }

  addAllPlans(): void {
    const selected = [...this._selectionCollector.selected];
    if (!selected.length) {
      return;
    }
    this._selectionCollector.clear();
    this.addPlans.emit(selected);
  }
}
