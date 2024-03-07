import { Component, inject, Input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { ExecutiontTaskParameters } from '../../client/step-client-module';
import { ScheduledTaskDialogsService } from '../../modules/scheduler-common';

type OnChange = (value?: ExecutiontTaskParameters) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-select-task',
  templateUrl: './select-task.component.html',
  styleUrls: ['./select-task.component.scss'],
})
export class SelectTaskComponent implements ControlValueAccessor {
  private _taskDialogs = inject(ScheduledTaskDialogsService);

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
    this._taskDialogs.selectTask().subscribe({
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
