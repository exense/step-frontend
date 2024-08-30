import { Component, inject } from '@angular/core';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';

@Component({
  selector: 'step-alt-execution-report-controls',
  templateUrl: './alt-execution-report-controls.component.html',
  styleUrl: './alt-execution-report-controls.component.scss',
})
export class AltExecutionReportControlsComponent {
  protected _printService = inject(AltExecutionReportPrintService);
}
