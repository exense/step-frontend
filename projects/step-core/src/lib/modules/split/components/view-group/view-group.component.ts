import { Component, computed, input, output } from '@angular/core';
import { StackViewInfoGroup } from '../../types/stack-view-info';
import { KeyValue, UpperCasePipe } from '@angular/common';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-view-group',
  imports: [StepBasicsModule, UpperCasePipe],
  templateUrl: './view-group.component.html',
  styleUrl: './view-group.component.scss',
})
export class ViewGroupComponent {
  readonly group = input<StackViewInfoGroup | undefined>(undefined);

  readonly openView = output<string>();

  protected readonly items = computed(() => {
    const group = this.group();
    const items = group?.children ?? [];
    return items.map((item) => {
      const key = item.id;
      const value = item.title[0];
      return { key, value } as KeyValue<string, string>;
    });
  });
}
