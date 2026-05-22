import { AfterViewInit, Component, inject } from '@angular/core';
import { ColumnContainer, CustomComponent } from '@exense/step-core';

@Component({
  selector: 'step-dashlet-empty-column',
  templateUrl: './dashlet-empty-column.component.html',
  styleUrl: './dashlet-empty-column.component.scss',
  standalone: false,
})
export class DashletEmptyColumnComponent implements CustomComponent, AfterViewInit {
  context?: any;

  private _columContainer = inject(ColumnContainer);

  ngAfterViewInit(): void {
    this._columContainer.initColumns();
  }
}
