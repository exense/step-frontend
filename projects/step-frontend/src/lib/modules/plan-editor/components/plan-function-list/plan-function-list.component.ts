import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AugmentedKeywordsService } from '@exense/step-core';

@Component({
  selector: 'step-plan-function-list',
  templateUrl: './plan-function-list.component.html',
  styleUrls: ['./plan-function-list.component.scss'],
})
export class PlanFunctionListComponent {
  readonly dataSource = inject(AugmentedKeywordsService).createFilteredTableDataSource();

  @Output() onSelection = new EventEmitter<string>();

  addFunction(id: string): void {
    this.onSelection.emit(id);
  }
}
