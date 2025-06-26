import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Operation, StepIconsModule } from '@exense/step-core';
import { AltOperationComponent } from '../alt-operation/alt-operation.component';

@Component({
  selector: 'step-alt-current-operations',
  imports: [AltOperationComponent, StepIconsModule],
  templateUrl: './alt-current-operations.component.html',
  styleUrl: './alt-current-operations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltCurrentOperationsComponent {
  readonly showAll = model(false);
  readonly currentOperations = input<Operation[]>([]);

  protected readonly firstOperation = computed(() => this.currentOperations()?.[0]);

  protected readonly isToggleVisible = computed(() => {
    const operations = this.currentOperations() ?? [];
    return operations.length > 1;
  });

  protected toggleShowAll(): void {
    this.showAll.update((value) => !value);
  }
}
