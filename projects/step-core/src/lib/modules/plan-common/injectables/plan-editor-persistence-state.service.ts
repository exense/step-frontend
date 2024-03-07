import { inject, Inject, Injectable } from '@angular/core';
import { filter, pairwise } from 'rxjs';
import { SCREEN_WIDTH, LOCAL_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class PlanEditorPersistenceStateService extends StorageProxy {
  private _screenWidth$ = inject(SCREEN_WIDTH);

  constructor(@Inject(LOCAL_STORAGE) _storage: Storage) {
    super(_storage, 'PLAN_EDITOR_STATE');
    this.setupTokensCleanupOnScreenChange();
  }

  getPanelSize(panelKey: string): number | undefined {
    const size = parseInt(this.getItem(`PANEL_${panelKey}`) ?? '');
    return !isNaN(size) ? size : undefined;
  }

  setPanelSize(panelKey: string, value: number): void {
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
