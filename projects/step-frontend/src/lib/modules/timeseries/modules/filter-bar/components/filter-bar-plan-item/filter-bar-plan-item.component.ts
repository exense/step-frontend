import { Component, inject, Input } from '@angular/core';
import { DateFormat, EntityDialogsService, Plan } from '@exense/step-core';
import { COMMON_IMPORTS, EntitySearchValue } from '../../../_common';

@Component({
  selector: 'step-ts-filter-bar-plan-item',
  templateUrl: './filter-bar-plan-item.component.html',
  styleUrls: ['./filter-bar-plan-item.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class FilterBarPlanItemComponent {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];

  private _entityDialogs = inject(EntityDialogsService);

  showPicker() {
    this._entityDialogs.selectEntityOfType('plans').subscribe((result) => {
      this.addSearchEntity(result.item as Plan);
    });
  }

  addSearchEntity(plan: Plan) {
    const id = plan.id!;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].searchValue === id) {
        this.values[i].entity = plan;
        return;
      }
    }
    this.values.push({ searchValue: id, entity: plan });
  }

  removeSearchValue(index: number) {
    console.log('REMOVING PLAN');
    this.values.splice(index, 1);
  }
}
