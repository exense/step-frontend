import { inject, Injectable, signal } from '@angular/core';
import { WsChannel } from './ws-channel';
import { map, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WsFactoryService {
  private _location = inject(DOCUMENT).location;

  connect<REQ, RESP>(url: string): WsChannel<REQ, RESP> {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    const fullChannelUrl = this.baseWsUrl + url;
    return new WsChannelImpl(fullChannelUrl);
  }

  private get baseWsUrl(): string {
    const protocol = this._location.protocol.replace('http', 'ws');
    const host = this._location.host;
    return `${protocol}//${host}/ws`;
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
