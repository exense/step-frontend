import { AfterViewInit, ChangeDetectorRef, Component, inject, input, Input } from '@angular/core';
import { DateFormat, EntityDialogsService, Execution } from '@exense/step-core';
import { COMMON_IMPORTS, EntitySearchValue } from '../../../_common';

@Component({
  selector: 'step-ts-filter-bar-execution-item',
  templateUrl: './filter-bar-execution-item.component.html',
  styleUrls: ['./filter-bar-execution-item.component.scss'],
  imports: [COMMON_IMPORTS],
})
export class FilterBarExecutionItemComponent implements AfterViewInit {
  readonly DateFormat = DateFormat;
  @Input() values!: EntitySearchValue[];
  showDialogOnInit = input<boolean | undefined>(false);

  private _entityDialogs = inject(EntityDialogsService);
  protected _cd = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    if (this.showDialogOnInit()) {
      setTimeout(() => {
        this._entityDialogs.selectEntityOfType('executions').subscribe((result) => {
          this.addSearchExecution(result.item as Execution);
        });
      }, 100);
    }
  }

  showExecutionPicker() {
    this._entityDialogs.selectEntityOfType('executions').subscribe((result) => {
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
    this._cd.markForCheck();
  }

  removeSearchValue(index: number) {
    this.values.splice(index, 1);
  }
}
