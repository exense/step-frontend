import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-tooltip-container',
  template: `
    @if (template) {
      <ng-container>
        <ng-container *ngTemplateOutlet="template; context: { $implicit: data }"></ng-container>
      </ng-container>
    }
  `,
  imports: [NgTemplateOutlet],
})
export class TooltipContainerComponent {
  @Input() template!: TemplateRef<any>;
  @Input() data!: any;

  update(template: TemplateRef<any>, data: any) {
    this.template = template;
    this.data = data;
  }
}
