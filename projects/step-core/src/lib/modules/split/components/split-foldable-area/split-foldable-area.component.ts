import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { StepIconsModule } from '../../../step-icons/step-icons.module';

@Component({
  selector: 'step-split-foldable-area',
  imports: [StepIconsModule],
  host: {
    '[class.active]': 'isActive()',
  },
  templateUrl: './split-foldable-area.component.html',
  styleUrl: './split-foldable-area.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SplitFoldableAreaComponent {
  readonly header = input.required<string>();
  readonly activeSectionHeader = input<string>();
  protected readonly isFolded = computed(() => {
    const header = this.header();
    const active = this.activeSectionHeader();
    return header !== active;
  });
  protected readonly isActive = computed(() => {
    const isFolded = this.isFolded();
    return !isFolded;
  });
  readonly activate = output<void>();
}
