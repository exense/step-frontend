import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AltExecutionTabsService, STATIC_TABS } from '../../services/alt-execution-tabs.service';
import { ExecutionViewModeService, Tab } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-alt-execution-tabs',
  templateUrl: './alt-execution-tabs.component.html',
  styleUrl: './alt-execution-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltExecutionTabsComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _tabsService = inject(AltExecutionTabsService);

  readonly STATIC_TABS = STATIC_TABS;

  readonly tabs = this._tabsService.tabs;

  closeTab(tab: Tab<string>, event: MouseEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    this._tabsService.removeTab(tab.id);
    if (this._router.url.includes(tab.id)) {
      this._router.navigate(['.'], { relativeTo: this._activatedRoute });
    }
  }
}
