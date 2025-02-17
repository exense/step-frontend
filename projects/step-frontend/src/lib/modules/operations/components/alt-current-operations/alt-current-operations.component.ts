import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { Operation, StepIconsModule, SystemService } from '@exense/step-core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { AltOperationComponent } from '../alt-operation/alt-operation.component';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'step-alt-current-operations',
  standalone: true,
  imports: [AltOperationComponent, MatIconButton, StepIconsModule],
  templateUrl: './alt-current-operations.component.html',
  styleUrl: './alt-current-operations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltCurrentOperationsComponent {
  private _api = inject(SystemService);

  /** @Input() / @Output() **/
  readonly showAll = model(false);

  /** @Input() **/
  readonly reportNodeId = input<string | undefined>(undefined);

  private currentOperations$ = toObservable(this.reportNodeId).pipe(
    switchMap((reportNodeId) => {
      if (!reportNodeId) {
        return of([] as Operation[]);
      }
      return this._api.getOperationsByReportNodeId(reportNodeId);
    }),
  );

  protected readonly currentOperations = toSignal(this.currentOperations$);

  protected readonly firstOperation = computed(() => this.currentOperations()?.[0]);

  protected readonly isToggleVisible = computed(() => {
    const operations = this.currentOperations() ?? [];
    return operations.length > 1;
  });

  protected toggleShowAll(): void {
    this.showAll.update((value) => !value);
  }
}
