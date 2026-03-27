import { Component, computed, input, output } from '@angular/core';
import { StackViewInfo } from '../../types/stack-view-info';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-view-item',
  imports: [StepBasicsModule],
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export class ViewItemComponent {
  readonly view = input.required<StackViewInfo>();
  readonly remove = output();

  protected readonly title = computed(() => this.view().title);
  protected readonly templateRef = computed(() => this.view().templateRef);
}
