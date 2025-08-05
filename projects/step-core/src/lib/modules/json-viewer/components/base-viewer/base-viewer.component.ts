import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseViewerComponent<T = string> implements OnChanges {
  @Input() json?: unknown;
  @Input() maxChars?: number;

  protected value?: T;

  ngOnChanges(changes: SimpleChanges): void {
    let json: unknown = undefined;
    let maxChars: number | undefined = undefined;

    const cJson = changes['json'];
    const cMaxChars = changes['maxChars'];

    if (cJson?.previousValue !== cJson?.currentValue || cJson?.firstChange) {
      json = cJson?.currentValue;
    }

    if (cMaxChars?.previousValue !== cMaxChars?.currentValue || cMaxChars?.firstChange) {
      maxChars = cMaxChars?.currentValue;
    }

    if (json !== undefined || maxChars !== undefined) {
      this.prepareValue(json, maxChars);
    }
  }

  protected abstract formatValue(json: unknown, maxChars?: number): T;

  private prepareValue(json?: unknown, maxChars?: number): void {
    json = json ?? this.json;
    maxChars = maxChars ?? this.maxChars;

    if (!json) {
      this.value = undefined;
      return;
    }

    this.value = this.formatValue(json, maxChars);
  }
}
