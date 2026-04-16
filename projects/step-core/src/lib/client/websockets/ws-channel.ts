import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface WsChannel<REQ, RESP> {
  readonly isConnected: Signal<boolean>;
  readonly data$: Observable<RESP | Blob>;
  readonly close$: Observable<CloseEvent>;
  readonly error$: Observable<unknown>;
  disconnect(): void;
  send(request: REQ): void;
}
