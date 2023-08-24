import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { EntitySearchValue } from '../entity-search-value';
import { DateFormat, EntityDialogsService } from '@exense/step-core';

@Component({
  selector: 'step-ts-filter-bar-execution-item',
  templateUrl: './filter-bar-execution-item.component.html',
  styleUrls: ['./filter-bar-execution-item.component.scss'],
})
export class FilterBarExecutionItemComponent {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];

  constructor(private _entityDialogs: EntityDialogsService) {}

  showExecutionPicker() {
    this._entityDialogs.selectEntityOfType('executions', true).subscribe((result) => {
      console.log(result);
      this.addSearchExecution(result.item);
    });
  }

  addSearchExecution(execution: any) {
    const executionId = execution.id;
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
