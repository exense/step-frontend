import { contentChild, Directive, input, TemplateRef } from '@angular/core';

@Directive({ selector: 'step-table[stepCustomCellSuffix]' })
export class CustomCellSuffixDirective {
  readonly column = input.required<string>({ alias: 'stepCustomCellSuffix' });
  readonly template = contentChild.required<TemplateRef<{ $implicit: unknown }>>('cellSuffix');
}
