import { Component, inject } from '@angular/core';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { IS_SMALL_SCREEN } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-report-controls',
  templateUrl: './alt-execution-report-controls.component.html',
  styleUrl: './alt-execution-report-controls.component.scss',
  standalone: false,
})
export class AltExecutionReportControlsComponent {
  protected _executionsState = inject(AltExecutionStateService);
  protected _printService = inject(AltExecutionReportPrintService);
  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  protected toggleGridEdit(): void {
    this._executionsState.gridEditMode.update((value) => !value);
  }
}
