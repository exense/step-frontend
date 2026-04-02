import { Component, computed, contentChild, input, untracked } from '@angular/core';
import { StackViewItemContentDirective } from '../../directives/stack-view-item-content.directive';
import { StackViewItemTitleDirective } from '../../directives/stack-view-item-title.directive';
import { StackViewInfo } from '../../types/stack-view-info';

@Component({
  selector: 'step-stack-view-item',
  imports: [],
  templateUrl: './stack-view-item.component.html',
  styleUrl: './stack-view-item.component.scss',
})
export class StackViewItemComponent {
  readonly itemId = input.required<string>();
  readonly itemTitle = input<string | unknown>();
  private readonly childTitle = contentChild(StackViewItemTitleDirective);
  private readonly childContent = contentChild(StackViewItemContentDirective);

  private readonly viewInfo = computed(() => {
    const itemId = this.itemId();
    const itemTitle = this.itemTitle();
    const childTitle = this.childTitle();
    const childContent = this.childContent();
    return {
      id: itemId,
      title: itemTitle,
      titleTemplateRef: childTitle?._templateRef,
      contentTemplateRef: childContent?._templateRef,
    } as StackViewInfo;
  });

  get stackViewInfo(): StackViewInfo {
    return untracked(() => this.viewInfo());
  }
}
