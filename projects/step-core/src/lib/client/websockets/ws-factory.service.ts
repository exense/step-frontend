import { inject, Injectable, signal } from '@angular/core';
import { WsChannel } from './ws-channel';
import { map, Observable, Subject, tap } from 'rxjs';
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
    this.data$ = this.websocket$.pipe(
      tap({
        error: (error) => this.errorInternal$.next(error),
      }),
      map((data) => data as RESP | Blob),
    );
  }

  private readonly isConnectedInternal = signal(false);
  private websocket$?: WebSocketSubject<unknown>;
  private closeInternal$ = new Subject<CloseEvent>();
  private errorInternal$ = new Subject<unknown>();
  private isDisconnectRequested = false;
  private pendingRequests: REQ[] = [];

  readonly isConnected = this.isConnectedInternal.asReadonly();
  readonly data$: Observable<RESP | Blob>;
  readonly close$ = this.closeInternal$.asObservable();
  readonly error$ = this.errorInternal$.asObservable();

  disconnect(): void {
    this.isDisconnectRequested = true;
    this.websocket$?.complete?.();
    this.websocket$ = undefined;
    this.isConnectedInternal.set(false);
    this.pendingRequests = [];
  }

  send(request: REQ): void {
    if (!this.isConnected()) {
      this.pendingRequests.push(request);
      return;
    }
    this.websocket$?.next?.(request);
  }

  private createWebsocket(url: string): WebSocketSubject<unknown> {
    return new WebSocketSubject({
      url,
      openObserver: {
        next: () => {
          this.isDisconnectRequested = false;
          this.isConnectedInternal.set(true);
          const queuedRequests = [...this.pendingRequests];
          this.pendingRequests = [];
          queuedRequests.forEach((request) => this.websocket$?.next?.(request));
        },
      },
      closeObserver: {
        next: (event) => {
          this.isConnectedInternal.set(false);
          this.closeInternal$.next(event);
          if (!this.isDisconnectRequested && event.code !== 1000) {
            this.errorInternal$.next(event);
          }
        },
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
