import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-cross-execution-report-controls',
  templateUrl: './cross-execution-report-controls.component.html',
  styleUrl: './cross-execution-report-controls.component.scss',
  standalone: false,
})
export class CrossExecutionReportControlsComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  protected readonly gridExtraItems: KeyValue<string, string>[] = [
    { key: 'performance', value: 'Performance Dashboard' },
  ];

  protected openPerformancePage(extraPresetId?: string): any {
    if (extraPresetId !== 'performance') {
      return;
    }
    this._router.navigate(['..', 'performance'], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
  }
}
