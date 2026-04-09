import { TemplateRef } from '@angular/core';

export interface StackViewInfo {
  id: string;
  title?: string;
  titleTemplateRef?: TemplateRef<unknown>;
  titleBreadcrumbsRef?: TemplateRef<unknown>;
  contentTemplateRef?: TemplateRef<unknown>;
}

export interface StackViewInfoGroup extends StackViewInfo {
  children: StackViewInfo[];
}
