import { inject, Injectable } from '@angular/core';
import { filter, pairwise } from 'rxjs';
import { SCREEN_WIDTH, LOCAL_STORAGE, StorageProxy } from '../../basics/step-basics.module';

const MIN_PANEL_SIZE = 100;

@Injectable({
  providedIn: 'root',
})
export class PlanEditorPersistenceStateService extends StorageProxy {
  private _screenWidth$ = inject(SCREEN_WIDTH);

  constructor() {
    super(inject(LOCAL_STORAGE), 'PLAN_EDITOR_STATE');
    this.setupTokensCleanupOnScreenChange();
  }

  getPanelSize(panelKey: string): number | undefined {
    const size = parseInt(this.getItem(`PANEL_${panelKey}`) ?? '');
    if (isNaN(size)) {
      return undefined;
    }
    if (size < MIN_PANEL_SIZE) {
      this.removeItem(`PANEL_${panelKey}`);
      return undefined;
    }
    return size;
  }

  setPanelSize(panelKey: string, value: number): void {
    if (value < MIN_PANEL_SIZE) {
      return;
    }
    this.setItem(`PANEL_${panelKey}`, value.toString());
  }

  private setupTokensCleanupOnScreenChange(): void {
    this._screenWidth$
      .pipe(
        pairwise(),
        filter(([previousWidth, currentWidth]) => previousWidth !== currentWidth),
      )
      .subscribe(() => this.clearTokens());
  }
}
