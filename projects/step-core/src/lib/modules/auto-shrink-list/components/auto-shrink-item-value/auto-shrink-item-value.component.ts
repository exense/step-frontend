import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { KeyValue, NgTemplateOutlet } from '@angular/common';
import { AutoShrinkItemActionTemplateDirective } from '../../directives/auto-shrink-item-action-template.directive';
import { AutoShrinkEmptyValueTemplateDirective } from '../../directives/auto-shrink-empty-value-template.directive';

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
  readonly emptyValue = input<AutoShrinkEmptyValueTemplateDirective>();
  readonly itemAction = input<AutoShrinkItemActionTemplateDirective>();
}
