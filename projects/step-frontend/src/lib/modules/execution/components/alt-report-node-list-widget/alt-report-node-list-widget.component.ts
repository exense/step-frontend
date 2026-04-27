import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { AltReportNodesSummaryStateService } from '../../services/alt-report-nodes-summary-state.service';
import { ViewMode } from '../../shared/view-mode';
import { AltReportNodeListSortDirective } from '../../directives/alt-report-node-list-sort.directive';

@Component({
  selector: 'step-alt-report-node-list-widget',
  templateUrl: './alt-report-node-list-widget.component.html',
  styleUrl: './alt-report-node-list-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: AltReportNodeListSortDirective,
      inputs: ['sortByColumn'],
    },
  ],
  standalone: false,
})
export class AltReportNodeListWidgetComponent {
  protected _state = inject(AltReportNodesSummaryStateService);
  protected _reportNodeListSort = inject(AltReportNodeListSortDirective, { self: true });

  readonly mode = input<ViewMode>(ViewMode.VIEW);

  protected readonly statusText = this._state.getStatusText();
  protected readonly searchText = this._state.getSearchText();

  protected readonly ViewMode = ViewMode;
}
