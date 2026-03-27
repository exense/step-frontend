import { Directive, inject, input, TemplateRef, untracked } from '@angular/core';
import { StackViewInfo } from '../types/stack-view-info';

@Directive({
  selector: '[stepStackViewItem]',
})
export class StackViewItemDirective {
  readonly itemId = input<string>('', { alias: 'stepStackViewItem' });
  readonly itemTitle = input('', { alias: 'stepStackViewItemTitle' });
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);

  get stackViewInfo(): StackViewInfo {
    const id = untracked(() => this.itemId());
    const title = untracked(() => this.itemTitle());
    const templateRef = this._templateRef;
    return { id, title, templateRef };
  }
}
