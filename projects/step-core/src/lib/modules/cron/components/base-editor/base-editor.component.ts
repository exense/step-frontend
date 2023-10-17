import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
  template: '',
})
export abstract class BaseEditorComponent implements AfterViewInit, OnChanges {
  @Input() isActive = true;
  @Output() expressionChange = new EventEmitter<string>();

  protected readonly trackByKeyValue: TrackByFunction<KeyValue<number | string, string>> = (_, item) => item.key;

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateExpression());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cIsActive = changes['isActive'];
    if (
      cIsActive &&
      !cIsActive.firstChange &&
      cIsActive.previousValue !== cIsActive.currentValue &&
      !!cIsActive.currentValue
    ) {
      queueMicrotask(() => this.updateExpression());
    }
  }

  protected abstract getExpression(): string;

  protected updateExpression(): void {
    if (!this.isActive) {
      return;
    }
    const expression = this.getExpression();
    this.expressionChange.emit(expression);
  }

  protected createRange(stop: number, start: number = 0, step: number = 1): number[] {
    return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
  }
}
