import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { IS_SMALL_SCREEN, ReportNode } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'step-alt-execution-report',
  templateUrl: './alt-execution-report.component.html',
  styleUrl: './alt-execution-report.component.scss',
  providers: [
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionReportComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  protected readonly _state = inject(AltExecutionStateService);

  protected readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  protected readonly keywordsSummary$ = inject(AltKeywordNodesStateService).summary$;
  protected readonly testCasesSummary$ = inject(AltTestCasesNodesStateService).summary$;
  protected readonly hasTestCases$ = this._state.testCases$.pipe(map((testCases) => !!testCases?.length));

  protected readonly _mode = inject(VIEW_MODE);

  // protected readonly gridSettings$: Observable<GridsterConfig> = this.hasTestCases$.pipe(
  //   map((hasTestCases) => {
  //     return {
  //       gridType: 'verticalFixed',
  //       displayGrid: 'onDrag&Resize',
  //       compactType: 'compactUp',
  //       draggable: { enabled: true, dragHandleClass: 'drag-icon', ignoreContent: true },
  //       resizable: { enabled: false },
  //       margin: 12,
  //       minCols: 4,
  //       maxCols: 4,
  //       minRows: 4,
  //       maxRows: 4,
  //       fixedRowHeight: 450,
  //       pushItems: true,
  //     };
  //   }),
  // );

  protected handleOpenNodeInTreeView(keyword: ReportNode): void {
    const artefactId = keyword.artefactID;
    if (!artefactId) {
      return;
    }
    this._router.navigate(['..', 'tree'], { queryParams: { artefactId }, relativeTo: this._activatedRoute });
  }

  /*
  protected handleOpenKeywordDrilldown(keyword: ReportNode): void {
    const id = keyword.id;
    if (!id) {
      return;
    }
    this._router.navigate(['..', 'keyword-drilldown', id], { relativeTo: this._activatedRoute });
  }
*/

  protected readonly ViewMode = ViewMode;
}
