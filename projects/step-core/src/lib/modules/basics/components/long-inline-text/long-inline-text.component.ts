import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { ElementSizeDirective } from '../../directives/element-size.directive';

@Component({
  selector: 'step-long-inline-text',
  imports: [ElementSizeDirective],
  templateUrl: './long-inline-text.component.html',
  styleUrl: './long-inline-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ElementSizeDirective],
  host: {
    '[class.cut-value]': 'cutValue()',
    '[attr.data-suffix]': 'suffix()',
  },
})
export class LongInlineTextComponent {
  private _elementSize = inject(ElementSizeDirective, { self: true });
  private fullValue = viewChild('fullValue', { read: ElementSizeDirective });

  readonly text = input('', {
    transform: (value?: string) => value ?? '',
  });

  private fullWidth = computed(() => this.fullValue()?.width?.());
  private availableWidth = this._elementSize.width;

  protected readonly cutValue = computed(() => {
    const fullWidth = this.fullWidth() ?? 0;
    const availableWidth = this.availableWidth();
    if (!availableWidth) {
      return false;
    }
    return availableWidth < fullWidth;
  });

  protected readonly suffix = computed(() => {
    const text = this.text();
    return '...' + text.slice(-6);
  });
}
