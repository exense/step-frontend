import { Component, inject } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-alt-execution-analytics-controls',
  templateUrl: './alt-execution-analytics-controls.component.html',
  styleUrl: './alt-execution-analytics-controls.component.scss',
  standalone: false,
})
export class AltExecutionAnalyticsControlsComponent {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  protected readonly gridExtraItems: KeyValue<string, string>[] = [{ key: 'performance', value: 'Performance Layout' }];

  protected openReport(extraPresetId?: string): any {
    if (extraPresetId !== undefined) {
      return;
    }
    this._router.navigate(['..', 'report'], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
  }
}
