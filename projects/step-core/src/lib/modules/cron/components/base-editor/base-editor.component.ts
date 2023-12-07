import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { trackByRange } from '../../injectables/ranges.tokens';

export interface ExpressionChangeEvent {
  expression: string;
  isTouched: boolean;
}

@Component({
  template: '',
})
export abstract class BaseEditorComponent implements AfterViewInit, OnChanges {
  @Input() isActive = true;
  @Output() expressionChange = new EventEmitter<ExpressionChangeEvent>();

  protected readonly trackByKeyValue = trackByRange;

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateExpression(true));
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

  protected updateExpression(isFirst: boolean = false): void {
    if (!this.isActive) {
      return;
    }

    if (isFirst) {
      this.expressionChange.emit({ expression: '', isTouched: false });
      return;
    }

    const expression = this.getExpression();
    this.expressionChange.emit({ expression, isTouched: true });
  }

  protected formatInterval(from?: number | null, to?: number | null, notSetValue = '*'): string {
    if (from === undefined || from === null || to === undefined || to === null) {
      return notSetValue;
    }

    if (from === to) {
      return from.toString();
    }

    return `${from}-${to}`;
  }
}
