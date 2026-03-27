import { TemplateRef } from '@angular/core';

export interface StackViewInfo {
  id: string;
  title: string;
  templateRef?: TemplateRef<unknown>;
}

export interface StackViewInfoGroup extends StackViewInfo {
  children: StackViewInfo[];
}
