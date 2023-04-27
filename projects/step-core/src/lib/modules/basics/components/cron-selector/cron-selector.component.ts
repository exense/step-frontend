import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-cron-selector',
  templateUrl: './cron-selector.component.html',
  styleUrls: ['./cron-selector.component.scss'],
  exportAs: 'stepCronSelector',
})
export class CronSelectorComponent implements OnDestroy {
  private terminator$ = new Subject<void>();

  @Input() label?: string;
  @Input() cronString?: string;

  @Output() cronStringChange = new EventEmitter<string | undefined>();

  readonly cronControl: FormControl;

  constructor(formBuilder: FormBuilder) {
    this.cronControl = formBuilder.control('');
  }

  applyPreset(cronString: string) {
    this.cronString = cronString;
    this.cronStringChange.emit(cronString);
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
