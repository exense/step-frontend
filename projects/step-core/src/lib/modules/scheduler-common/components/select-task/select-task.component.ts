import { Component, inject, Input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.constant';
import { AugmentedSchedulerService, ExecutiontTaskParameters } from '../../../../client/step-client-module';
import { EntityDialogsService } from '../../../entity/injectables/entity-dialogs.service';
import { map, of, switchMap } from 'rxjs';

type OnChange = (value?: ExecutiontTaskParameters) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-select-task',
  templateUrl: './select-task.component.html',
  styleUrl: './select-task.component.scss',
  imports: [SCHEDULER_COMMON_IMPORTS],
})
export class SelectTaskComponent implements ControlValueAccessor {
  private _entityDialogs = inject(EntityDialogsService);
  private _schedulerService = inject(AugmentedSchedulerService);

  @Input() showRequiredMarker?: boolean;
  @Input() label: string = 'Task';

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected isDisabled = false;
  protected taskValue?: ExecutiontTaskParameters;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj?: ExecutiontTaskParameters): void {
    this.taskValue = obj;
  }

  selectTask(): void {
    this._entityDialogs
      .selectEntityOfType('tasks')
      .pipe(
        map((result) => result?.item?.id),
        switchMap((id) => (!id ? of(undefined) : this._schedulerService.getExecutionTaskById(id))),
      )
      .subscribe({
        next: (task) => {
          this.taskValue = task;
          this.onChange?.(task);
        },
        complete: () => {
          this.onTouch?.();
        },
      });
  }
}
