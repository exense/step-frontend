import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionError } from '../shared/connection-error';
import { HttpErrorLoggerService } from '../injectables/http-error-logger.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private _snackBar = inject(MatSnackBar);
  private _errorLogger = inject(HttpErrorLoggerService);

  private handleHttpError(error: HttpErrorResponse, skip401: boolean = false): Observable<any> {
    this._errorLogger.log('Network Error', error);
    if (error.status === 401 && skip401) {
      return throwError(() => error);
    }

    let jsonError = error.error;
    if (typeof error.error === 'string' && error.headers.get('Content-Type') === 'application/json') {
      jsonError = JSON.parse(error.error);
    }
    let parsedError;
    if (jsonError?.errorMessage) {
      parsedError = HttpErrorInterceptor.formatError(jsonError);
    } else if (error.name && error.message) {
      parsedError = HttpErrorInterceptor.formatError(`${error.name}: ${error.message}`);
    } else if (jsonError) {
      parsedError = HttpErrorInterceptor.formatError(jsonError);
    } else {
      parsedError = HttpErrorInterceptor.formatError('Unknown HTTP error');
    }

    if (this.isConnectionError(parsedError)) {
      return throwError(() => new ConnectionError(error));
    }

    this.showError(parsedError);

    return throwError(() => error);
  }

  private handleAsyncError(response: HttpEvent<any>): HttpEvent<any> {
    if (response instanceof HttpResponse && response.body?.error) {
      this._errorLogger.log('Non HTTP Error', response.body?.error);
      const parsedError = HttpErrorInterceptor.formatError(response.body?.error);
      this.showError(parsedError);
    }
    return response;
  }

  static formatError(error: any) {
    let parsedError;
    if (error?.errorName && error?.errorMessage) {
      parsedError = `${error.errorName}: ${error.errorMessage}`;
    } else if (error?.errorName || error?.errorMessage) {
      parsedError = error.errorName || error.errorMessage;
    } else if (error?.error && error?.text) {
      parsedError = `${error.error}: ${error.text}`;
    } else if (error?.error || error?.text) {
      parsedError = error.error || error.text;
    } else {
      parsedError = error;
    }

    return parsedError;
  }

  private showError(error: any) {
    if (typeof error !== 'string') {
      this._errorLogger.log('Error with unknown format', error);
    } else {
      this._snackBar.open(error, 'dismiss');
    }
  }

  private isConnectionError(error: any): boolean {
    return typeof error === 'string' && error.endsWith(': 0 Unknown Error');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((response: HttpEvent<any>) => {
        this.handleAsyncError(response);
      }),
      catchError((error) => this.handleHttpError(error, true)),
    );
  }
}
