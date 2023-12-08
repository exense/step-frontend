import { Observable } from 'rxjs';

export interface AutoRefreshModel {
  readonly interval: number;
  readonly disabled: boolean;
  readonly autoIncreaseTo?: number;

  readonly disableChange$: Observable<boolean>;
  readonly intervalChange$: Observable<number>;
  readonly refresh$: Observable<void>;

  setInterval(interval: number, isManualChange?: boolean): void;
  setDisabled(disabled: boolean): void;
  setAutoIncreaseTo(autoIncreaseTo?: number): void;

  destroy(): void;
}
