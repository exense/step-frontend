import { ChangeDetectionStrategy, Component, effect, inject, model, ViewEncapsulation } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ColorChooserComponent } from '../color-chooser/color-chooser.component';
import { ColorFieldContainerService } from '../../injectables/color-field-container.service';
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Component({
  selector: 'step-color-picker-content',
  standalone: true,
  imports: [StepBasicsModule, ColorChooserComponent, CdkTrapFocus],
  templateUrl: './color-picker-content.component.html',
  styleUrl: './color-picker-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ColorPickerContentComponent {
  private _field = inject(ColorFieldContainerService);

  protected color = model(this._field.getModel());

  private effectColorChange = effect(() => {
    const color = this.color();
    if (color !== this._field.getModel()) {
      this._field.setModel(color);
    }
  });
}
