import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { StackViewInfo } from '../../types/stack-view-info';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-view-item',
  imports: [StepBasicsModule],
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
  host: {
    '[class.is-last]': 'isLast()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class ViewItemComponent {
  readonly view = input.required<StackViewInfo>();
  readonly canMinimize = input(false);
  readonly canMaximize = input(false);
  readonly isLast = input(false);
  readonly remove = output();
  readonly minimize = output();
  readonly maximize = output();

  protected readonly title = computed(() => this.view().title);
  protected readonly titleTemplateRef = computed(() => this.view().titleTemplateRef);
  protected readonly contentTemplateRef = computed(() => this.view().contentTemplateRef);
}
