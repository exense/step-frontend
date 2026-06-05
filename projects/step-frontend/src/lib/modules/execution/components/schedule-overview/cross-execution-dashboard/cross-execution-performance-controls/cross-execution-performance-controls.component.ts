import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-cross-execution-performance-controls',
  templateUrl: './cross-execution-performance-controls.component.html',
  styleUrl: './cross-execution-performance-controls.component.scss',
  standalone: false,
})
export class CrossExecutionPerformanceControlsComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  protected readonly gridExtraItems: KeyValue<string, string>[] = [
    { key: 'performance', value: 'Performance Dashboard' },
  ];

  protected openReport(extraPresetId?: string): any {
    if (extraPresetId !== undefined) {
      return;
    }
    this._router.navigate(['..', 'report'], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
  }
}
