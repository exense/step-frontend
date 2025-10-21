import { ChangeDetectionStrategy, Component, input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KeyValue, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-auto-shrink-item-value',
  imports: [NgTemplateOutlet],
  templateUrl: './auto-shrink-item-value.component.html',
  styleUrl: './auto-shrink-item-value.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoShrinkItemValueComponent {
  readonly item = input.required<KeyValue<string, string>>();
  readonly emptyValueTemplate = input<TemplateRef<unknown>>();
}
