import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { EntitySearchValue } from '../entity-search-value';
import { DateFormat, EntityDialogsService, ExecutiontTaskParameters } from '@exense/step-core';

@Component({
  selector: 'step-ts-filter-bar-task-item',
  templateUrl: './filter-bar-task-item.component.html',
  styleUrls: ['./filter-bar-task-item.component.scss'],
})
export class FilterBarTaskItemComponent {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];

  private _entityDialogs = inject(EntityDialogsService);

  showPicker() {
    this._entityDialogs.selectEntityOfType('tasks', true).subscribe((result) => {
      this.addSearchExecution(result.item as ExecutiontTaskParameters);
    });
  }

  addSearchExecution(task: ExecutiontTaskParameters) {
    const executionId = task.id!;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].searchValue === executionId) {
        this.values[i].entity = task;
        return;
      }
    }
    this.values.push({ searchValue: executionId, entity: task });
  }

  removeSearchValue(index: number) {
    this.values.splice(index, 1);
  }
}
