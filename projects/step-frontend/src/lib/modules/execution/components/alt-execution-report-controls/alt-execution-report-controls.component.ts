import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'step-alt-execution-report-controls',
  templateUrl: './alt-execution-report-controls.component.html',
  styleUrl: './alt-execution-report-controls.component.scss',
})
export class AltExecutionReportControlsComponent {
  private _doc = inject(DOCUMENT);

  printReport(): void {
    this._doc?.defaultView?.print();
  }
}
