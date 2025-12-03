import { Inject, inject, Injectable } from '@angular/core';
import { filter, pairwise } from 'rxjs';
import { LOCAL_STORAGE, SCREEN_WIDTH, StorageProxy } from '../../basics/step-basics.module';

export interface SplitAreaSizeController {
  getSize(): number | undefined;
  setSize(value: number): void;
}

@Injectable({
  providedIn: 'root',
})
export class SplitResizableAreaPersistenceService extends StorageProxy {
  private _screenWidth$ = inject(SCREEN_WIDTH);

  constructor(@Inject(LOCAL_STORAGE) _storage: Storage) {
    super(_storage, 'SPLIT_RESIZALBE_AREA_STATE');
    this.setupTokensCleanupOnScreenChange();
  }

  createSplitAreaSizeController(key: string): SplitAreaSizeController {
    const getSize = () => this.getPanelSize(`${key}_PANEL`);
    const setSize = (value: number) => this.setPanelSize(`${key}_PANEL`, value);
    return {
      getSize,
      setSize,
    };
  }

  private getPanelSize(panelKey: string): number | undefined {
    const size = parseInt(this.getItem(panelKey) ?? '');
    return !isNaN(size) ? size : undefined;
  }

  private setPanelSize(panelKey: string, value: number): void {
    this.setItem(panelKey, value.toString());
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
