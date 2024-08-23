import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay, tap, switchMap } from 'rxjs';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AugmentedControllerService, ReportNode } from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-alt-keyword-drilldown',
  templateUrl: './alt-keyword-drilldown.component.html',
  styleUrl: './alt-keyword-drilldown.component.scss',
})
export class AltKeywordDrilldownComponent {
  private _tabsService = inject(AltExecutionTabsService);

  private _activatedRoute = inject(ActivatedRoute);
  private _controllerService = inject(AugmentedControllerService);

  private keywordId$ = this._activatedRoute.params.pipe(map((params) => params['keywordId']));

  readonly keyword$ = this.keywordId$.pipe(
    switchMap((keywordId) => this._controllerService.getReportNode(keywordId)),
    tap((keyword) => {
      if (keyword) {
        this.addTabForKeyword(keyword);
      }
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  private addTabForKeyword(keyword: ReportNode): void {
    const link = `keyword-drilldown/${keyword.id!}`;
    this._tabsService.addTab(keyword.id!, keyword.name!, link);
  }
}
