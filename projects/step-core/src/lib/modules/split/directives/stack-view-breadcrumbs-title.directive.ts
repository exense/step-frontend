import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewBreadcrumbsTitle]',
})
export class StackViewBreadcrumbsTitleDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
