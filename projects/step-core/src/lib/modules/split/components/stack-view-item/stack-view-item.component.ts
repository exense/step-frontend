import { Component, computed, contentChild, input, untracked } from '@angular/core';
import { StackViewItemContentDirective } from '../../directives/stack-view-item-content.directive';
import { StackViewItemTitleDirective } from '../../directives/stack-view-item-title.directive';
import { StackViewInfo } from '../../types/stack-view-info';
import { StackViewBreadcrumbsTitleDirective } from '../../directives/stack-view-breadcrumbs-title.directive';
import { StackViewItemMiniatureDirective } from '../../directives/stack-view-item-miniature.directive';

@Component({
  selector: 'step-stack-view-item',
  imports: [],
  templateUrl: './stack-view-item.component.html',
  styleUrl: './stack-view-item.component.scss',
})
export class StackViewItemComponent {
  readonly itemId = input.required<string>();
  readonly itemTitle = input<string | undefined>();
  readonly breadcrumbsTooltip = input<string | undefined>();
  private readonly childTitle = contentChild(StackViewItemTitleDirective);
  private readonly childContent = contentChild(StackViewItemContentDirective);
  private readonly childBreadcrumbsTitle = contentChild(StackViewBreadcrumbsTitleDirective);
  private readonly childMiniature = contentChild(StackViewItemMiniatureDirective);

  private readonly viewInfo = computed(() => {
    const itemId = this.itemId();
    const itemTitle = this.itemTitle();
    const childTitle = this.childTitle();
    const breadcrumbsTooltip = this.breadcrumbsTooltip();
    const breadcrumbsTitle = this.childBreadcrumbsTitle();
    const childContent = this.childContent();
    const childMiniature = this.childMiniature();
    return {
      id: itemId,
      title: itemTitle,
      breadcrumbsTooltip: breadcrumbsTooltip,
      titleTemplateRef: childTitle?._templateRef,
      titleBreadcrumbsRef: breadcrumbsTitle?._templateRef,
      contentTemplateRef: childContent?._templateRef,
      miniatureTemplateRef: childMiniature?._templateRef,
    } as StackViewInfo;
  });

  get stackViewInfo(): StackViewInfo {
    return untracked(() => this.viewInfo());
  }
}
