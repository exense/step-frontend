import { ElementRef } from '@angular/core';

export interface ColorField {
  getModel(): string | undefined;
  setModel(value?: string): void;
  isDisabled(): boolean;
  getConnectedOverlayOrigin(): ElementRef | undefined;
}
