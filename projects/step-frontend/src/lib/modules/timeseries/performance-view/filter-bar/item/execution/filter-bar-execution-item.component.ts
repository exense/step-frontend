import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { EntitySearchValue } from '../entity-search-value';
import { DateFormat, EntityDialogsService, Execution } from '@exense/step-core';

@Component({
  selector: 'step-ts-filter-bar-execution-item',
  templateUrl: './filter-bar-execution-item.component.html',
  styleUrls: ['./filter-bar-execution-item.component.scss'],
})
export class FilterBarExecutionItemComponent {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];

  private _entityDialogs = inject(EntityDialogsService);

  showExecutionPicker() {
    this._entityDialogs.selectEntityOfType('executions', true).subscribe((result) => {
      this.addSearchExecution(result.item as Execution);
    });
  }

  addSearchExecution(execution: Execution) {
    const executionId = execution.id!;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].searchValue === executionId) {
        this.values[i].entity = execution;
        return;
      }
    }
    this.values.push({ searchValue: executionId, entity: execution });
  }

  removeSearchValue(index: number) {
    this.values.splice(index, 1);
  }
}
