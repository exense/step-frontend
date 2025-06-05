import {
  HttpClient,
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, noop, Observable, retry, switchMap, take, throwError } from 'rxjs';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { ConnectionError } from '../shared/connection-error';
import { AlertsService, AlertType } from '@exense/step-core';
import { HttpErrorLoggerService } from '../injectables/http-error-logger.service';

const MSG_CONNECTION_ERROR =
  'Connection issue to the server. Please ensure that you are connected to the internet and that your Step server is running.';
const MSG_CONNECTION_SUCCESS = 'Connection to Step server successfully recovered';

const CHECK_CONNECTION_REQUEST = new HttpContextToken<boolean>(() => false);

@Injectable()
export class ConnectionErrorInterceptor implements HttpInterceptor, OnDestroy {
  private _alerts = inject(AlertsService);
  private _http = inject(HttpClient);
  private _errorLogger = inject(HttpErrorLoggerService);

  private handledRequest$ = new BehaviorSubject<HttpRequest<any> | undefined>(undefined);
  private continue$ = this.handledRequest$.pipe(
    filter((value) => !value),
    map(() => true),
  );

  private messageId?: string;

  private get hasHandledRequest(): boolean {
    return !!this.handledRequest$.value;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (!(error instanceof ConnectionError) || req.context.has(CHECK_CONNECTION_REQUEST)) {
          return throwError(() => error);
        }

        if (!this.hasHandledRequest) {
          this.handleConnectionErrorRequest(req);
        }

        return this.continue$.pipe(
          take(1),
          switchMap(() => next.handle(req)),
        );
      }),
    );
  }

  ngOnDestroy(): void {
    this.handledRequest$.complete();
  }

  private handleConnectionErrorRequest(request: HttpRequest<any>): void {
    const handledRequest = request.clone();
    handledRequest.context.set(CHECK_CONNECTION_REQUEST, true);
    this.handledRequest$.next(handledRequest);
    this.messageId = this._alerts.add(MSG_CONNECTION_ERROR, AlertType.DANGER);
    this._errorLogger.disable();
    this._http
      .request(handledRequest)
      .pipe(
        retry({
          delay: 1000,
        }),
        filter((response) => response instanceof HttpResponse),
      )
      .subscribe({
        next: () => {
          this._alerts.replace(this.messageId!, MSG_CONNECTION_SUCCESS, AlertType.SUCCESS, 5000);
          this._errorLogger.enable();
          this.handledRequest$.next(undefined);
          this.messageId = undefined;
        },
        error: noop,
      });
  }
}
