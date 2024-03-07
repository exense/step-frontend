import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, filter, noop, Observable, retry, throwError } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { ConnectionError } from '../shared/connection-error';
import { AlertsService, AlertType } from '@exense/step-core';
import { HttpErrorLoggerService } from '../injectables/http-error-logger.service';

const MSG_CONNECTION_ERROR =
  'Connection issue to the server. Please ensure that you are connected to the internet and that your Step server is running.';
const MSG_CONNECTION_SUCCESS = 'Connection to Step server successfully recovered';

@Injectable()
export class ConnectionErrorInterceptor implements HttpInterceptor {
  private _alerts = inject(AlertsService);
  private _http = inject(HttpClient);
  private _errorLogger = inject(HttpErrorLoggerService);

  private handledRequest?: HttpRequest<any>;
  private messageId?: string;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof ConnectionError && !this.handledRequest) {
          this.handleConnectionErrorRequest(req);
        }

        return throwError(() => error);
      }),
    );
  }

  private handleConnectionErrorRequest(request: HttpRequest<any>): void {
    this.handledRequest = request.clone();
    this.messageId = this._alerts.add(MSG_CONNECTION_ERROR, AlertType.DANGER);
    this._errorLogger.disable();
    this._http
      .request(this.handledRequest)
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
          this.handledRequest = undefined;
          this.messageId = undefined;
        },
        error: noop,
      });
  }
}
