import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, combineLatest, shareReplay, tap } from 'rxjs';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-alt-keyword-drilldown',
  templateUrl: './alt-keyword-drilldown.component.html',
  styleUrl: './alt-keyword-drilldown.component.scss',
})
export class AltKeywordDrilldownComponent {
  private _tabsService = inject(AltExecutionTabsService);

  private _activatedRoute = inject(ActivatedRoute);
  private _state = inject(AltExecutionStateService);

  private keywordId$ = this._activatedRoute.params.pipe(map((params) => params['keywordId']));

  readonly keyword$ = combineLatest([this._state.keywords$, this.keywordId$]).pipe(
    map(([keywords, keywordId]) => keywords.find((keyword) => keyword.id === keywordId)),
    tap((keyword) => {
      if (keyword) {
        this.addTabForKeyword(keyword);
      }
    }),
    shareReplay(1),
  );

  private addTabForKeyword(keyword: ReportNode): void {
    const link = `keyword-drilldown/${keyword.id!}`;
    this._tabsService.addTab(keyword.id!, keyword.name!, link);
  }
}
