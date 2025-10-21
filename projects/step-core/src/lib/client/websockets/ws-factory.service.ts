import { inject, Injectable, signal } from '@angular/core';
import { WsChannel } from './ws-channel';
import { map, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { APP_HOST } from '../_common';

@Injectable({
  providedIn: 'root',
})
export class WsFactoryService {
  private _appHost = inject(APP_HOST);

  connect<REQ, RESP>(url: string): WsChannel<REQ, RESP> {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    const fullChannelUrl = this.baseWsUrl + url;
    return new WsChannelImpl(fullChannelUrl);
  }

  private get baseWsUrl(): string {
    const wsHost = this._appHost.replace('http', 'ws');
    return `${wsHost}/ws`;
  }
}

class WsChannelImpl<REQ, RESP> implements WsChannel<REQ, RESP> {
  constructor(private url: string) {
    this.websocket$ = this.createWebsocket(url);
    this.data$ = this.websocket$.pipe(map((data) => data as RESP | Blob));
  }

  private isConnectedInternal = signal(false);
  private websocket$?: WebSocketSubject<unknown>;

  readonly isConnected = this.isConnectedInternal.asReadonly();
  readonly data$: Observable<RESP | Blob>;

  disconnect(): void {
    this.websocket$?.complete?.();
    this.websocket$ = undefined;
    this.isConnectedInternal.set(false);
  }

  send(request: REQ): void {
    if (!this.isConnected()) {
      console.error(`Websocket not connected to url: ${this.url}`);
      return;
    }
    this.websocket$?.next?.(request);
  }

  private createWebsocket(url: string): WebSocketSubject<unknown> {
    return new WebSocketSubject({
      url,
      openObserver: {
        next: () => this.isConnectedInternal.set(true),
      },
      closeObserver: {
        next: () => this.isConnectedInternal.set(false),
      },
      deserializer: (e: MessageEvent) => {
        if (typeof e.data === 'string') {
          return JSON.parse(e.data);
        }
        return e.data;
      },
    });
  }
}
