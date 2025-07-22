import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { trackByRange } from '../../injectables/ranges.tokens';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseEditorComponent implements AfterViewInit, OnChanges {
  @Input() isActive = true;
  @Output() expressionChange = new EventEmitter<string>();

  protected readonly trackByKeyValue = trackByRange;

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
