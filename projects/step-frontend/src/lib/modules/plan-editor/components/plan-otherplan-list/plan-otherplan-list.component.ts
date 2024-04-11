import { Component, EventEmitter, inject, Output, ViewEncapsulation } from '@angular/core';
import { AugmentedPlansService, tableColumnsConfigProvider } from '@exense/step-core';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorOtherPlanTable',
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class PlanOtherplanListComponent {
  @Output() onSelection = new EventEmitter<string>();

  readonly dataSource = inject(AugmentedPlansService).getPlansTableDataSource();

  addPlan(id: string): void {
    this.onSelection.emit(id);
  }
}
