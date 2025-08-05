import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[mat-header-cell]:not([mat-sort-header])',
  templateUrl: './header-cell-container.component.html',
  styleUrl: './header-cell-container.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class HeaderCellContainerComponent {}
