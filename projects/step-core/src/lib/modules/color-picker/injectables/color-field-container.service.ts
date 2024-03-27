import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { ColorField } from '../types/color-field';

@Injectable()
export class ColorFieldContainerService implements ColorField, OnDestroy {
  private field?: ColorField;

  registerField(field?: ColorField): void {
    this.field = field;
  }

  getConnectedOverlayOrigin(): ElementRef | undefined {
    return this.field?.getConnectedOverlayOrigin();
  }

  getModel(): string | undefined {
    return this.field?.getModel();
  }

  isDisabled(): boolean {
    return this.field?.isDisabled() ?? false;
  }

  setModel(value?: string): void {
    this.field?.setModel(value);
  }

  ngOnDestroy(): void {
    this.field = undefined;
  }
}
