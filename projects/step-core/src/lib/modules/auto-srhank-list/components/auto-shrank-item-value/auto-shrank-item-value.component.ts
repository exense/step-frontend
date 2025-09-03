import { ChangeDetectionStrategy, Component, input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KeyValue, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-auto-shrank-item-value',
  imports: [NgTemplateOutlet],
  templateUrl: './auto-shrank-item-value.component.html',
  styleUrl: './auto-shrank-item-value.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoShrankItemValueComponent {
  readonly item = input.required<KeyValue<string, string>>();
  readonly emptyValueTemplate = input<TemplateRef<unknown>>();
}
