import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AugmentedPlansService } from '@exense/step-core';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
})
export class PlanOtherplanListComponent {
  @Output() onSelection = new EventEmitter<string>();

  readonly dataSource = inject(AugmentedPlansService).getPlansTableDataSource();

  addPlan(id: string): void {
    this.onSelection.emit(id);
  }
}
