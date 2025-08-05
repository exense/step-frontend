import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-tooltip-container',
  template: `
    @if (template) {
      <ng-container>
        <ng-container *ngTemplateOutlet="template; context: context"></ng-container>
      </ng-container>
    }
  `,
  imports: [NgTemplateOutlet],
})
export class TooltipContainerComponent {
  @Input() template!: TemplateRef<any>;
  @Input() data!: any;
  @Input() reposition?: () => void;

  update(template: TemplateRef<any>, data: any, reposition?: () => void) {
    this.template = template;
    this.data = data;
    this.reposition = reposition;
  }

  get context() {
    return {
      $implicit: this.data, // for let-data
      reposition: this.reposition, // for let-reposition
    };
  }
}
