import { Component, inject } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'step-alt-execution-keyword-drilldown-dialog',
  templateUrl: './alt-execution-keyword-drilldown-dialog.component.html',
  styleUrl: './alt-execution-keyword-drilldown-dialog.component.scss',
})
export class AltExecutionKeywordDrilldownDialogComponent {
  private _activatedRoute = inject(ActivatedRoute);

  protected readonly reportNode = toSignal(
    this._activatedRoute.data.pipe(map((data) => data['node'] as ReportNode | undefined)),
  );
}
