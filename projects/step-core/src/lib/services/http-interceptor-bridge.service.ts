import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum BridgeEventType {
  REQUEST = 'REQUEST',
  ERROR = 'ERROR',
  RESPONSE = 'RESPONSE',
}

export interface BridgeRequestEvent<T> {
  type: BridgeEventType.REQUEST;
  request: T;
}

export interface BridgeErrorEvent<T> {
  type: BridgeEventType.ERROR;
  error: T;
}

export interface BridgeResponseEvent<T> {
  type: BridgeEventType.RESPONSE;
  response: T;
}

export type BridgeHttpEvent<T> = BridgeRequestEvent<T> | BridgeErrorEvent<T> | BridgeResponseEvent<T>;

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorBridgeService<T> {
  private readonly bridgeHttpEventInternal = new Subject<BridgeHttpEvent<T>>();

  readonly bridgeHttpEvent$ = this.bridgeHttpEventInternal.asObservable();

  broadcast(event: BridgeHttpEvent<T>): void {
    this.bridgeHttpEventInternal.next(event);
  }
}
