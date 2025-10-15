import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface WsChannel<REQ, RESP> {
  readonly isConnected: Signal<boolean>;
  readonly data$: Observable<RESP | Blob>;
  disconnect(): void;
  send(request: REQ): void;
}
