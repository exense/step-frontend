import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { ColorField } from '../types/color-field';
import { ColorPickerSettings } from '../types/color-picker-settings';

@Injectable()
export class ColorFieldContainerService implements ColorField, OnDestroy {
  private field?: ColorField;
  private settings: ColorPickerSettings = {
    showClearColor: true,
  };

  setup(settings: ColorPickerSettings): this {
    this.settings = settings;
    return this;
  }

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

  getSettings(): ColorPickerSettings {
    return this.settings;
  }
}
