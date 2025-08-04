import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { DateFormat, EntityDialogsService, ExecutiontTaskParameters } from '@exense/step-core';
import { COMMON_IMPORTS, EntitySearchValue } from '../../../_common';

@Component({
  selector: 'step-ts-filter-bar-task-item',
  templateUrl: './filter-bar-task-item.component.html',
  styleUrls: ['./filter-bar-task-item.component.scss'],
  imports: [COMMON_IMPORTS],
})
export class FilterBarTaskItemComponent {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];

  private _entityDialogs = inject(EntityDialogsService);
  protected _cd = inject(ChangeDetectorRef);

  showPicker() {
    this._entityDialogs.selectEntityOfType('tasks').subscribe((result) => {
      this.addSearchTask(result.item as ExecutiontTaskParameters);
    });
  }

  addSearchTask(task: ExecutiontTaskParameters) {
    const taskId = task.id!;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].searchValue === taskId) {
        this.values[i].entity = task;
        return;
      }
    }
    this.values.push({ searchValue: taskId, entity: task });
    this._cd.markForCheck();
  }

  removeSearchValue(index: number) {
    this.values.splice(index, 1);
  }
}
