import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { ViewMode } from '../../shared/view-mode';

@Component({
  selector: 'step-alt-report-node-list',
  templateUrl: './alt-report-node-list.component.html',
  styleUrl: './alt-report-node-list.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeListComponent {
  protected _state = inject(AltReportNodesStateService);

  /** @Input() **/
  title = input('');

  /** @Input() **/
  mode = input<ViewMode>(ViewMode.VIEW);

  protected readonly statusText = this._state.getStatusText();
  protected readonly searchText = this._state.getSearchText();

  protected readonly ViewMode = ViewMode;
}
