import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpecificOperations } from '../../types/specific-operations.enum';
import { Operation } from '@exense/step-core';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'step-alt-operation',
  imports: [KeyValuePipe],
  templateUrl: './alt-operation.component.html',
  styleUrl: './alt-operation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltOperationComponent {
  protected readonly SpecificOperations = SpecificOperations;

  /** @Input() **/
  readonly operation = input<Operation | undefined>(undefined);

  /** @Input() **/
  readonly showOnlyDetails = input(false);

  protected isObject = computed(() => {
    const operation = this.operation();
    const details = operation?.details;
    return !!details && typeof details === 'object';
  });
}
