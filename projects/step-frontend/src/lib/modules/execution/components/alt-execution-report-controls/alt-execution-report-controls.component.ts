import { Component, inject } from '@angular/core';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { IS_SMALL_SCREEN } from '@exense/step-core';
import { KeyValue } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-alt-execution-report-controls',
  templateUrl: './alt-execution-report-controls.component.html',
  styleUrl: './alt-execution-report-controls.component.scss',
  standalone: false,
})
export class AltExecutionReportControlsComponent {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  protected _printService = inject(AltExecutionReportPrintService);
  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  protected readonly gridExtraItems: KeyValue<string, string>[] = [{ key: 'performance', value: 'Performance' }];

  protected openPerformancePage(extraPresetId?: string): any {
    if (extraPresetId !== 'performance') {
      return;
    }
    this._router.navigate(['..', 'analytics'], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
  }
}
