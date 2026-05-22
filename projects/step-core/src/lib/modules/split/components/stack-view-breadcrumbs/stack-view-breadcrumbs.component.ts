import { Component, input, output } from '@angular/core';
import { StackViewInfo } from '../../types/stack-view-info';
import { NgTemplateOutlet } from '@angular/common';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-stack-view-breadcrumbs',
  imports: [NgTemplateOutlet, StepBasicsModule],
  templateUrl: './stack-view-breadcrumbs.component.html',
  styleUrl: './stack-view-breadcrumbs.component.scss',
})
export class StackViewBreadcrumbsComponent {
  readonly views = input.required<StackViewInfo[]>();
  readonly openView = output<string>();
}
