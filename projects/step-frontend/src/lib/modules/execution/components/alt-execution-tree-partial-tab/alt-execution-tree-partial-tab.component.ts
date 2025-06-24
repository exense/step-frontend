import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { AugmentedControllerService, ElementSizeDirective } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, shareReplay, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionTabsService, STATIC_TABS } from '../../services/alt-execution-tabs.service';

@Component({
  selector: 'step-alt-execution-tree-partial-tab',
  templateUrl: './alt-execution-tree-partial-tab.component.html',
  styleUrl: './alt-execution-tree-partial-tab.component.scss',
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [ElementSizeDirective],
})
export class AltExecutionTreePartialTabComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _controllerService = inject(AugmentedControllerService);
  private _tabsService = inject(AltExecutionTabsService);

  private reportNodeId$ = this._activatedRoute.params.pipe(
    map((params) => params['reportNodeId'] as string),
    filter((reportNodeId) => !!reportNodeId),
  );

  protected readonly reportNode$ = this.reportNodeId$.pipe(
    switchMap((nodeId) => this._controllerService.getReportNode(nodeId)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  protected showSpinner = signal(false);

  ngOnInit(): void {
    this.initializeTab();
  }

  private initializeTab(): void {
    this.reportNode$.subscribe((reportNode) => {
      this._tabsService.addTab(
        reportNode.id!,
        `Tree: ${reportNode.name}`,
        `sub-tree/${reportNode.id!}`,
        STATIC_TABS.ANALYTICS,
      );
    });
  }
}
