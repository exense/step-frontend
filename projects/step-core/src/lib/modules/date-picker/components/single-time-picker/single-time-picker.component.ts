import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { KeyValue } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { map, Subject, takeUntil } from 'rxjs';
import { createRange } from '../../../basics/shared/create-range';
import { Time } from '../../types/time';

@Component({
  selector: 'step-single-time-picker',
  templateUrl: './single-time-picker.component.html',
  styleUrls: ['./single-time-picker.component.scss'],
})
export class SingleTimePickerComponent implements OnInit, OnChanges, OnDestroy {
  private terminator$ = new Subject<void>();
  private _fb = inject(FormBuilder).nonNullable;

  readonly hours = createRange(23).map(this.convert);
  readonly minutes = createRange(59).map(this.convert);
  readonly seconds = createRange(59).map(this.convert);

  readonly trackByKeyValue: TrackByFunction<KeyValue<number, string>> = (index, item) => item.key;

  readonly timeForm = this._fb.group({
    hour: this._fb.control(0),
    minute: this._fb.control(0),
    second: this._fb.control(0),
  });

  @Input() label?: string;
  @Input() time?: Time;
  @Output() timeChange = new EventEmitter<Time>();

  ngOnInit(): void {
    this.timeForm.valueChanges
      .pipe(
        map((value) => value as Time),
        takeUntil(this.terminator$)
      )
      .subscribe((time) => this.timeChange.emit(time));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cTime = changes['time'];
    if (cTime?.previousValue !== cTime?.currentValue || cTime.firstChange) {
      const time = cTime?.currentValue as Time | undefined;
      this.timeForm.setValue(
        {
          hour: time?.hour ?? 0,
          minute: time?.minute ?? 0,
          second: time?.second ?? 0,
        },
        { emitEvent: false }
      );
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  private convert(key: number): KeyValue<number, string> {
    const value = key.toString().padStart(2, '0');
    return { key, value };
  }
}
