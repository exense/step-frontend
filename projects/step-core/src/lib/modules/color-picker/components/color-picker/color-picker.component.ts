import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { ColorFieldContainerService } from '../../injectables/color-field-container.service';
import { PopoverOverlayService } from '../../../basics/step-basics.module';
import { ColorField } from '../../types/color-field';
import { ColorPickerContentComponent } from '../color-picker-content/color-picker-content.component';
import { ColorPickerSettings } from '../../types/color-picker-settings';

@Component({
  selector: 'step-color-picker',
  standalone: true,
  imports: [],
  template: '',
  encapsulation: ViewEncapsulation.None,
  exportAs: 'ColorPicker',
  providers: [ColorFieldContainerService, PopoverOverlayService],
})
export class ColorPickerComponent {
  private _popoverOverlay = inject(PopoverOverlayService);
  private _fieldContainer = inject(ColorFieldContainerService);

  @Input() xPosition: 'start' | 'end' = 'start';
  @Input() yPosition: 'above' | 'below' = 'below';

  registerInput(field: ColorField): void {
    this._fieldContainer.registerField(field);
  }

  open(settings?: ColorPickerSettings): void {
    const xPosition = this.xPosition;
    const yPosition = this.yPosition;

    if (settings) {
      this._fieldContainer.setup(settings);
    }

    this._popoverOverlay
      .setPositions({ xPosition, yPosition })
      .open(ColorPickerContentComponent, this._fieldContainer.getConnectedOverlayOrigin()?.nativeElement);
  }

  close(): void {
    this._popoverOverlay.close();
  }
}
