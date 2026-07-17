import { Directive, inject, TemplateRef } from '@angular/core';
import { KeyValue } from '@angular/common';

@Directive({
  selector: '[stepAutoShrinkItemActionTemplate]',
})
export class AutoShrinkItemActionTemplateDirective {
  private readonly _templateRef = inject<TemplateRef<{ $implicit: KeyValue<string, string> }>>(TemplateRef);

  get templateRef(): TemplateRef<{ $implicit: KeyValue<string, string> }> {
    return this._templateRef;
  }
}
