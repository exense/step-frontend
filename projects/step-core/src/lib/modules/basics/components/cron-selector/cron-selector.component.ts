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
export class CronSelectorComponent {
  @Input() label?: string;
  @Input() cronString?: string;

  @Output() cronStringChange = new EventEmitter<string | undefined>();

  valueChange(value: string) {
    this.cronString = value;
    this.cronStringChange.emit(value);
  }
}
