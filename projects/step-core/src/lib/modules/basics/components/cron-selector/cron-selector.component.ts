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

  applyPreset(cronString: string) {
    this.cronString = cronString;
    this.valueChange();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  valueChange() {
    this.cronStringChange.emit(this.cronString);
  }
}
