import { Component, computed, input, output, TemplateRef } from '@angular/core';
import { StackViewInfoGroup } from '../../types/stack-view-info';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ViewItemDefaultNamePipe } from '../../pipes/view-item-default-name.pipe';

@Component({
  selector: 'step-view-group',
  imports: [StepBasicsModule, ViewItemDefaultNamePipe],
  templateUrl: './view-group.component.html',
  styleUrl: './view-group.component.scss',
})
export class ViewGroupComponent {
  readonly group = input<StackViewInfoGroup | undefined>(undefined);
  readonly viewGroupTooltip = input<TemplateRef<unknown> | undefined>(undefined);

  readonly openView = output<string>();

  protected readonly items = computed(() => {
    const group = this.group();
    return group?.children ?? [];
  });
}
