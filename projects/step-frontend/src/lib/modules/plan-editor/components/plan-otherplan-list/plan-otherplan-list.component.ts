import { Component, inject, output, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  tableColumnsConfigProvider,
  AutoDeselectStrategy,
  Plan,
  selectionCollectionProvider,
  SelectionCollector,
} from '@exense/step-core';
import { map } from 'rxjs';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.KEEP_SELECTION),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorOtherPlanTable',
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class PlanOtherplanListComponent {
  private _selectionCollector = inject<SelectionCollector<string, Plan>>(SelectionCollector);

  readonly dataSource = inject(AugmentedPlansService).getPlansTableDataSource();

  readonly hasSelection$ = this._selectionCollector.length$.pipe(map((length) => length > 0));

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
