import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';
import { ActionColDirective } from './action-col.directive';

const ACTIONS_COLUMN_SETTINGS_CONTAINER = 'actions-column-settings-container';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-column-settings',
  standalone: false,
})
export class SettingsInsideActionColDirective implements AfterViewInit, OnDestroy {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _actionCol = inject(ActionColDirective, { optional: true });
  private _renderer = inject(Renderer2);

  private headerCell?: HTMLTableCellElement | null;

  ngAfterViewInit(): void {
    if (!this._actionCol) {
      return;
    }
    this.headerCell = this._elRef.nativeElement.closest('th');
    if (!this.headerCell) {
      return;
    }
    this._renderer.addClass(this.headerCell, ACTIONS_COLUMN_SETTINGS_CONTAINER);
  }

  ngOnDestroy(): void {
    if (!this.headerCell) {
      return;
    }
    this._renderer.removeClass(this.headerCell, ACTIONS_COLUMN_SETTINGS_CONTAINER);
  }
}
